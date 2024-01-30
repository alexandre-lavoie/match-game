import AdmZip from "adm-zip";
import { XMLBuilder } from "fast-xml-parser";
import child_process from "node:child_process";
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

function cordova(...args: string[]): string | null {
  const res = child_process.spawnSync("cordova", args, { cwd: __dirname });

  return res.error
    ? null
    : (res.output as Buffer[])
        .filter((value) => value)
        .map((buffer: Buffer) => buffer.toString("utf-8"))
        .join("\n");
}

function copyWWW(dir: string): boolean {
  const distPath = path.join(dir, "dist");
  if (!fs.existsSync(dir)) return false;

  const wwwPath = path.join(__dirname, "www");
  if (fs.existsSync(wwwPath))
    fs.rmSync(wwwPath, { recursive: true, force: true });

  fs.cpSync(distPath, wwwPath, { recursive: true });

  return true;
}

function makeConfigXMLPlatform(
  platform: ConfigXML["platform"],
  icon?: string
): Record<string, any> {
  let resIcon: string | undefined = undefined;
  if (icon) {
    resIcon = path.join("res", platform, path.basename(icon));
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

function makeConfigXML({
  name,
  description,
  organization,
  version,
  author,
  icon,
  platform,
}: ConfigXML): string {
  const builder = new XMLBuilder({ ignoreAttributes: false });

  let xml: string = builder.build({
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
      platform: makeConfigXMLPlatform(platform, icon),
    },
    "@_xmlns": "http://www.w3.org/ns/widgets",
    "@_xmlns:cdv": "http://cordova.apache.org/ns/1.0",
  });

  xml = xml.replace(new RegExp("></icon>", "g"), "/>");

  return xml;
}

const DEFAULT_PERSON: Person = {
  name: "John Doe",
  email: "john.doe@example.com",
  url: "https://example.com",
};

const PERSON_NAME_REGEX = /(.+?)\s(\<|\()/g;
const PERSON_EMAIL_REGEX = /\<(.+?)\>/g;
const PERSON_URL_REGEX = /\((.+?)\)/g;

function parsePerson(data: PackageJSON["author"]): Person {
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

function loadPackageJSON(dir: string): PackageJSON | null {
  const jsonPath = path.join(dir, "package.json");
  if (!fs.existsSync(jsonPath)) return null;

  const data = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf-8" }));

  return data;
}

function makeConfigFromPackage(
  dir: string,
  pkg: PackageJSON,
  platform: ConfigXML["platform"]
): ConfigXML {
  let icon: string | undefined = pkg.icon;

  if (icon && !path.isAbsolute(icon)) icon = path.join(dir, icon);
  if (icon && !fs.existsSync(icon)) icon = undefined;

  return {
    name: pkg.name ?? "game",
    description: pkg.description ?? "Description",
    version: pkg.version ?? "0.0.0",
    author: parsePerson(pkg.author),
    organization: pkg.organization ?? "com.example",
    icon,
    platform,
  };
}

function writeConfigXML(config: ConfigXML): boolean {
  const configPath = path.join(__dirname, "config.xml");

  if (config.icon) {
    const resPath = path.join(__dirname, "res");

    if (!fs.existsSync(resPath)) fs.mkdirSync(resPath, { recursive: true });

    fs.cpSync(
      config.icon,
      path.join(resPath, config.platform, path.basename(config.icon))
    );
  }

  const xml = makeConfigXML(config);
  fs.writeFileSync(configPath, xml);

  return true;
}

function writeElectronSettingsJSON(): boolean {
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

function writeBuildJSON(data: Record<string, any>): boolean {
  const buildPath = path.join(__dirname, "build.json");

  fs.writeFileSync(buildPath, JSON.stringify(data));

  return true;
}

function packageElectron(
  dir: string,
  pkg: PackageJSON,
  build: Record<string, any>,
  release: boolean = true
): boolean {
  if (!copyWWW(dir)) return false;

  const config = makeConfigFromPackage(dir, pkg, "electron");
  if (!config) return false;

  if (!writeConfigXML(config)) return false;

  if (!writeBuildJSON(build)) return false;

  if (!writeElectronSettingsJSON()) return false;

  cordova("platform", "add", "electron");

  const status = cordova(
    "build",
    "electron",
    release ? "--release" : "--debug"
  );
  if (status === undefined) return false;
  console.log(status);

  return true;
}

function copyElectronBuild(fileName: string, platform: string): boolean {
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

function packageAndroid(dir: string, release: boolean = true): boolean {
  if (!copyWWW(dir)) return false;

  const pkg = loadPackageJSON(dir);
  if (!pkg) return false;

  const config = makeConfigFromPackage(dir, pkg, "android");
  if (!config) return false;

  if (!writeConfigXML(config)) return false;

  cordova("platform", "rm", "android");
  cordova("platform", "add", "android");

  const status = cordova("build", "android", release ? "--release" : "--debug");
  if (status === undefined) return false;
  console.log(status);

  return true;
}

function packageLinux(dir: string, release: boolean = true): boolean {
  const pkg = loadPackageJSON(dir);
  if (!pkg) return false;

  const build = {
    electron: {
      linux: {
        category: "Game",
        package: ["AppImage"],
      },
    },
  };
  if (!packageElectron(dir, pkg, build, release)) return false;

  return copyElectronBuild(`${pkg.name}-${pkg.version}.AppImage`, "linux");
}

function packageWeb(dir: string, _release: boolean = true): boolean {
  const pkg = loadPackageJSON(dir);
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

function packageWindows(dir: string, release: boolean = true): boolean {
  const pkg = loadPackageJSON(dir);
  if (!pkg) return false;

  const build = {
    electron: {
      windows: {
        package: ["portable"],
      },
    },
  };
  if (!packageElectron(dir, pkg, build, release)) return false;

  return copyElectronBuild(`${pkg.name} ${pkg.version}.exe`, "windows");
}

function cli(): boolean {
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

  return packagePlatform[argv.platform](...args);
}

if (typeof require !== "undefined" && require.main === module) {
  const status = cli();

  if (!status) process.exitCode = 1;
}
