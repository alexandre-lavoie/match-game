import Phaser from "phaser";

import type { Board } from "./board";
import { BoardRenderer } from "./renderer";

/**
 * Sound for {@link Board}
 */
export class BoardSound<TValueKey extends string = string> extends Phaser
  .GameObjects.Container {
  private readonly boardRenderer: BoardRenderer<TValueKey>;

  public constructor(
    scene: Phaser.Scene,
    boardRenderer: BoardRenderer<TValueKey>
  ) {
    super(scene);

    this.boardRenderer = boardRenderer;
    this.attachCallbacks();
  }

  private attachCallbacks() {
    this.boardRenderer
      .onSelect(this.select, this)
      .onCollect(this.collect, this);
  }

  private removeCallbacks() {
    this.boardRenderer
      .offSelect(this.select, this)
      .offCollect(this.collect, this);
  }

  protected preDestroy(): void {
    this.removeCallbacks();

    super.preDestroy();
  }

  /**
   * Sound for {@link Board.select}.
   */
  protected select(_x: number, _y: number, offset: number): void {
    this.scene.sound.play("select", {
      rate: 1 + offset * 0.1,
    });
  }

  /**
   * Sound for {@link Board.match}.
   */
  protected collect(_x: number, _y: number, offset: number): void {
    this.scene.sound.play("collect", {
      rate: 1 + offset * 0.1,
    });
  }
}
