import Phaser from "phaser";

import { RESIZE_RANGES } from "../config";
import { FightGame } from "../game";

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
    const game = new FightGame();

    // Start the game scene.
    const scale = this.scale.width;

    Object.entries(RESIZE_RANGES).some(([key, [l, r]]) => {
      if (scale >= l && scale < r && this.scene.key !== key) {
        this.scene.start(key, { game });

        return true;
      }

      return false;
    });
  }
}
