import Phaser from "phaser";

import { DesktopGameScene } from "./scenes/game/desktop";
import { MobileGameScene } from "./scenes/game/mobile";
import "./style.css";

const GameScene =
  Math.min(window.innerWidth, window.innerHeight) < 800
    ? MobileGameScene
    : DesktopGameScene;

document.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game({
    title: "Match Game",
    type: Phaser.CANVAS,
    scene: [GameScene],
    scale: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    backgroundColor: "#000000",
  });
});
