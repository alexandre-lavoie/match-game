import Phaser from "phaser";

import { SampleGame } from "../game/game";

/**
 * Entrypoint of the game.
 */
export class InitScene extends Phaser.Scene {
  public constructor() {
    super({
      key: "init",
    });
  }

  public create() {
    // Create an instance of the game.
    const game = new SampleGame();

    // Start the game scene.
    this.scene.start("game", { game });
  }
}
