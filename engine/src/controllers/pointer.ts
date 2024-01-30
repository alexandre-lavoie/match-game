import Phaser from "phaser";

import { Entity } from "../entities/entity";
import { Controller } from "./controller";

/**
 * Controller for mouse and touch screens.
 */
export class PointerController<
  TValueKey extends string = string,
> extends Controller<TValueKey> {
  public constructor(scene: Phaser.Scene, entity: Entity<TValueKey>) {
    super(scene, entity);

    this.scene.input.on("pointerdown", this.dragStart, this);
    this.scene.input.on("pointermove", this.dragMove, this);
    this.scene.input.on("pointerup", this.dragFinish, this);
  }

  public destroy(fromScene?: boolean | undefined): void {
    this.scene.input.off("pointerdown", this.dragStart, this);
    this.scene.input.off("pointermove", this.dragMove, this);
    this.scene.input.off("pointerup", this.dragFinish, this);

    super.destroy(fromScene);
  }

  /**
   * Start a drag.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns If update was successful.
   */
  private dragStart(pointer: Phaser.Input.Pointer): boolean {
    return this.dragUpdate(pointer, false);
  }

  /**
   * Move a drag.
   */
  private dragMove(pointer: Phaser.Input.Pointer): boolean {
    if (!pointer.isDown) return false;

    return this.dragUpdate(pointer);
  }

  /**
   * End a drag and match.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  private dragFinish(pointer: Phaser.Input.Pointer): boolean {
    this.dragUpdate(pointer, false);

    this.match();

    return true;
  }

  /**
   * Update a drag.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @param checkSelectRange Flag to enable/disable checking distance from the center of nearest tile.
   *  If enabled, reduces tile selection to a smaller radius around the center of the nearest tile.
   * @returns If update was successful.
   */
  private dragUpdate(
    pointer: Phaser.Input.Pointer,
    checkSelectRange: boolean = true
  ): boolean {
    const boardRenderer = this.entity.getGame().getBoardRenderer();

    const tile = boardRenderer.getTileWorld(pointer.worldX, pointer.worldY);
    if (tile === null) return false;

    if (checkSelectRange) {
      const tileSize = boardRenderer.getTileSize();
      const tilePosition = boardRenderer.alignToGrid(
        pointer.worldX,
        pointer.worldY
      );
      if (tilePosition === null) return false;

      if (Math.abs(pointer.worldX - tilePosition.x) > tileSize.x / 3)
        return false;
      if (Math.abs(pointer.worldY - tilePosition.y) > tileSize.y / 3)
        return false;
    }

    this.select(tile.x, tile.y);

    return true;
  }
}
