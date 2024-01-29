import Phaser from "phaser";

import { FONT_SIZE } from "../game/config";
import { SampleGame } from "../game/game";

/**
 * End of game with automatic reset.
 */
export class EndScene extends Phaser.Scene {
  private matchGame!: SampleGame;

  private gameOver!: Phaser.GameObjects.Text;

  public constructor() {
    super({
      key: "end",
    });
  }

  public init({ game }: { game: SampleGame }) {
    this.matchGame = game;
  }

  public create() {
    // Reset board for next play.
    this.matchGame.getBoard().reset();

    this.gameOver = this.add.text(0, 0, "Game Over", {
      font: `bold ${FONT_SIZE}px Arial`,
    });

    this.input.on("pointerdown", () => {
      this.scene.start("game", { game: this.matchGame });
    });

    this.scale.on(
      "resize",
      (_gameSize: any, baseSize: { width: number; height: number }) =>
        this.resize(baseSize.width, baseSize.height)
    );
    this.resize(this.scale.width, this.scale.height);
  }

  /**
   * Handle screen resize.
   *
   * @param width new width of scene.
   * @param height new height of scene.
   */
  private resize(width: number, height: number) {
    this.gameOver.x = width / 2;
    this.gameOver.y = height / 2;
  }
}
