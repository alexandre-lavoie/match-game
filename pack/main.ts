import AdmZip from "adm-zip";
// @ts-ignore
import { cli as cordovaCli } from "cordova";
import { XMLBuilder } from "fast-xml-parser";
import fs from "node:fs";
import path from "node:path";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

interface Person {
  name: string;
  email: string;
  url: string;
}

interface PackageJSON {
  name: string;
  description?: string;
  version: string;
  author?: Person | string;
  organization?: string;
  icon?: string;
}

interface ConfigXML {
  name: string;
  description: string;
  version: string;
  author: Person;
  organization: string;
  icon?: string;
  platform: "android" | "ios" | "electron";
}

async function cordova(...args: string[]): Promise<boolean> {
  try {
    await cordovaCli(["node", "cordova", ...args]);
  } catch (e) {
    return false;
  }

  return true;
}

async function copyWWW(dir: string): Promise<boolean> {
  const distPath = path.join(dir, "dist");
  if (!fs.existsSync(dir)) return false;

  const wwwPath = path.join(__dirname, "www");
  if (fs.existsSync(wwwPath))
    fs.rmSync(wwwPath, { recursive: true, force: true });

  fs.cpSync(distPath, wwwPath, { recursive: true });

  return true;
}

async function makeConfigXMLPlatform(
  platform: ConfigXML["platform"],
  icon?: string
): Promise<Record<string, any>> {
  let resIcon: string | undefined = undefined;
  if (icon) {
    resIcon = `res/${platform}/${path.basename(icon)}`;
  }

  switch (platform) {
    case "electron":
      return {
        "@_name": "electron",
        icon: resIcon
          ? [
              {
                "@_src": resIcon,
              },
              {
                "@_src": resIcon,
                "@_target": "app",
              },
              {
                "@_src": resIcon,
                "@_target": "installer",
              },
            ]
          : undefined,
        preference: {
          "@_name": "ElectronSettingsFilePath",
          "@_value": "res/electron/settings.json",
        },
      };
    default:
      return {};
  }
}

async function makeConfigXML({
  name,
  description,
  organization,
  version,
  author,
  icon,
  platform,
}: ConfigXML): Promise<string> {
  const builder = new XMLBuilder({ ignoreAttributes: false });

  const jsObj = {
    "?xml": { "@_version": "1.0", "@_encoding": "utf-8" },
    "@_id": `${organization}.${name}`,
    "@_version": version,
    widget: {
      name: name,
      description: description,
      author: {
        "#text": author.name,
        "@_email": author.email,
        "@_href": author.url,
      },
      content: {
        "@_src": "index.html",
      },
      platform: await makeConfigXMLPlatform(platform, icon),
    },
    "@_xmlns": "http://www.w3.org/ns/widgets",
    "@_xmlns:cdv": "http://cordova.apache.org/ns/1.0",
  };

  return builder.build(jsObj);
}

const DEFAULT_PERSON: Person = {
  name: "John Doe",
  email: "john.doe@example.com",
  url: "https://example.com",
};

const PERSON_NAME_REGEX = /(.+?)\s(\<|\()/g;
const PERSON_EMAIL_REGEX = /\<(.+?)\>/g;
const PERSON_URL_REGEX = /\((.+?)\)/g;

async function parsePerson(data: PackageJSON["author"]): Promise<Person> {
  if (data === null || data === undefined) return DEFAULT_PERSON;

  if (typeof data === "string") {
    const name = (
      PERSON_NAME_REGEX.exec(data)?.[1] ?? DEFAULT_PERSON.name
    ).trim();
    const email = (
      PERSON_EMAIL_REGEX.exec(data)?.[1] ?? DEFAULT_PERSON.email
    ).trim();
    const url = (PERSON_URL_REGEX.exec(data)?.[1] ?? DEFAULT_PERSON.url).trim();

    return {
      name,
      email,
      url,
    };
  } else {
    return {
      ...DEFAULT_PERSON,
      ...data,
    };
  }
}

async function loadPackageJSON(dir: string): Promise<PackageJSON | null> {
  const jsonPath = path.join(dir, "package.json");
  if (!fs.existsSync(jsonPath)) return null;

  const data = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf-8" }));

  return data;
}

async function makeConfigFromPackage(
  dir: string,
  pkg: PackageJSON,
  platform: ConfigXML["platform"]
): Promise<ConfigXML> {
  let icon: string | undefined = pkg.icon;

  if (icon && !path.isAbsolute(icon)) icon = path.join(dir, icon);
  if (icon && !fs.existsSync(icon)) icon = undefined;

  return {
    name: pkg.name ?? "game",
    description: pkg.description ?? "Description",
    version: pkg.version ?? "0.0.0",
    author: await parsePerson(pkg.author),
    organization: pkg.organization ?? "com.example",
    icon,
    platform,
  };
}

async function writeConfigXML(config: ConfigXML): Promise<boolean> {
  const configPath = path.join(__dirname, "config.xml");

  if (config.icon) {
    const resPath = path.join(__dirname, "res");

    if (!fs.existsSync(resPath)) fs.mkdirSync(resPath, { recursive: true });

    fs.cpSync(
      config.icon,
      path.join(resPath, config.platform, path.basename(config.icon))
    );
  }

  const xml = await makeConfigXML(config);
  fs.writeFileSync(configPath, xml);

  return true;
}

async function writeElectronSettingsJSON(): Promise<boolean> {
  const electronPath = path.join(__dirname, "res", "electron");
  if (!fs.existsSync(electronPath))
    fs.mkdirSync(electronPath, { recursive: true });

  const settingsPath = path.join(electronPath, "settings.json");
  fs.writeFileSync(
    settingsPath,
    JSON.stringify({
      browserWindow: {
        webviewTag: false,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
        },
      },
    })
  );

  return true;
}

async function writeBuildJSON(data: Record<string, any>): Promise<boolean> {
  const buildPath = path.join(__dirname, "build.json");

  fs.writeFileSync(buildPath, JSON.stringify(data));

  return true;
}

async function packageElectron(
  dir: string,
  pkg: PackageJSON,
  build: Record<string, any>,
  release: boolean = true
): Promise<boolean> {
  if (!(await copyWWW(dir))) return false;

  const config = await makeConfigFromPackage(dir, pkg, "electron");
  if (!config) return false;

  if (!(await writeConfigXML(config))) return false;

  if (!(await writeBuildJSON(build))) return false;

  if (!(await writeElectronSettingsJSON())) return false;

  if (!fs.existsSync(path.join(__dirname, "platforms", "electron")))
    await cordova("platform", "add", "electron");

  if (!(await cordova("build", "electron", release ? "--release" : "--debug")))
    return false;

  return true;
}

async function copyElectronBuild(
  fileName: string,
  platform: string
): Promise<boolean> {
  const filePath = path.join(
    __dirname,
    "platforms",
    "electron",
    "build",
    fileName
  );
  if (!fs.existsSync(filePath)) return false;

  const outputFolder = path.join(__dirname, "dist", platform);
  if (!fs.existsSync(outputFolder))
    fs.mkdirSync(outputFolder, { recursive: true });

  fs.cpSync(filePath, path.join(outputFolder, fileName.replace(" ", "-")), {
    force: true,
  });

  return true;
}

async function packageAndroid(
  dir: string,
  release: boolean = true
): Promise<boolean> {
  if (!(await copyWWW(dir))) return false;

  const pkg = await loadPackageJSON(dir);
  if (!pkg) return false;

  const config = await makeConfigFromPackage(dir, pkg, "android");
  if (!config) return false;

  if (!(await writeConfigXML(config))) return false;

  await cordova("platform", "rm", "android");
  await cordova("platform", "add", "android");

  if (!(await cordova("build", "android", release ? "--release" : "--debug")))
    return false;

  return true;
}

async function packageLinux(
  dir: string,
  release: boolean = true
): Promise<boolean> {
  const pkg = await loadPackageJSON(dir);
  if (!pkg) return false;

  const build = {
    electron: {
      linux: {
        category: "Game",
        package: ["AppImage"],
      },
    },
  };
  if (!(await packageElectron(dir, pkg, build, release))) return false;

  return await copyElectronBuild(
    `${pkg.name}-${pkg.version}.AppImage`,
    "linux"
  );
}

async function packageWeb(
  dir: string,
  _release: boolean = true
): Promise<boolean> {
  const pkg = await loadPackageJSON(dir);
  if (!pkg) return false;

  const distPath = path.join(dir, "dist");
  if (!fs.existsSync(dir)) return false;

  const zip = new AdmZip();
  zip.addLocalFolder(distPath);

  const outputFolder = path.join(__dirname, "dist", "web");
  if (!fs.existsSync(outputFolder))
    fs.mkdirSync(outputFolder, { recursive: true });

  zip.writeZip(path.join(outputFolder, `${pkg.name}-${pkg.version}.zip`));

  return true;
}

async function packageWindows(
  dir: string,
  release: boolean = true
): Promise<boolean> {
  const pkg = await loadPackageJSON(dir);
  if (!pkg) return false;

  const build = {
    electron: {
      windows: {
        package: ["portable"],
      },
    },
  };
  if (!(await packageElectron(dir, pkg, build, release))) return false;

  return await copyElectronBuild(`${pkg.name} ${pkg.version}.exe`, "windows");
}

async function cli(): Promise<boolean> {
  const argv = yargs(hideBin(process.argv))
    .option("platform", {
      type: "string",
      describe: "platform to package",
      choices: ["android", "linux", "web", "windows"] as const,
      demandOption: true,
    })
    .option("path", {
      type: "string",
      describe: "path to built game",
      demandOption: true,
    })
    .option("workspace", {
      type: "boolean",
      describe: "build relative to workspace root",
      default: false,
    })
    .option("debug", {
      type: "boolean",
      describe: "build in debug mode",
      default: false,
    })
    .parseSync();

  let absolutePath: string = argv.path;
  if (!path.isAbsolute(argv.path)) {
    if (argv.workspace) {
      absolutePath = path.join(__dirname, "..", argv.path);
    } else {
      absolutePath = path.join(process.cwd(), argv.path);
    }
  }

  if (!fs.existsSync(absolutePath)) return false;

  const args = [absolutePath, !argv.debug] as const;
  const packagePlatform: Record<
    (typeof argv)["platform"],
    typeof packageLinux
  > = {
    android: packageAndroid,
    linux: packageLinux,
    web: packageWeb,
    windows: packageWindows,
  };

  return await packagePlatform[argv.platform](...args);
}

if (typeof require !== "undefined" && require.main === module) {
  cli().then((status) => {
    if (!status) process.exitCode = 1;
  });
}
