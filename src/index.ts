import "./style.css";

import Phaser from "phaser";

import { GameScene } from "./scenes/game";

document.addEventListener("DOMContentLoaded", () => {
    new Phaser.Game({
        title: "Match Game",
        type: Phaser.CANVAS,
        scene: [GameScene],
        scale: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        backgroundColor: "#000000"
    });
});
