import Phaser from "phaser";

import { InitScene } from "./scenes/init";
import { LargeGameScene } from "./scenes/views/large";
import { MediumGameScene } from "./scenes/views/medium";
import { SmallGameScene } from "./scenes/views/small";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game({
    title: "Fight Game",
    type: Phaser.AUTO,
    scene: [InitScene, SmallGameScene, MediumGameScene, LargeGameScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    backgroundColor: "#000000",
  });
});
