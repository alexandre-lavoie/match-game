import Phaser from "phaser";

import { EndScene } from "./scenes/end";
import { GameScene } from "./scenes/game";
import { InitScene } from "./scenes/init";
import "./style.css";

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game({
    title: "Sample Game",
    type: Phaser.AUTO,
    scene: [InitScene, GameScene, EndScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: "100%",
      height: "100%",
    },
    backgroundColor: "#000000",
  });
});
