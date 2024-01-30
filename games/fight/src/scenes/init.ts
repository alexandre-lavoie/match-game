import { AIController, PointerController } from "match-game";
import Phaser from "phaser";

import { FightAI } from "../ai";
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

    // Create controllers
    const playerController = new PointerController(this, game.getPlayer());
    game.addController(playerController);
    this.add.existing(playerController);

    const enemyController = new AIController(
      this,
      game.getEnemy(),
      new FightAI()
    );
    game.addController(enemyController);
    this.add.existing(enemyController);

    // Start the game scene.
    for (let [key, [minWidth, minHeight]] of RESIZE_RANGES) {
      if (this.scale.width >= minWidth && this.scale.height >= minHeight) {
        this.scene.launch(key, { game });

        break;
      }
    }
  }
}
