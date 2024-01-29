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

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) =>
      this.dragFinish(pointer.worldX, pointer.worldY)
    );
    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) =>
      this.dragStart(pointer.worldX, pointer.worldY)
    );
    this.scene.input.on(
      "pointermove",
      (pointer: Phaser.Input.Pointer) =>
        pointer.isDown && this.dragUpdate(pointer.worldX, pointer.worldY)
    );
  }

  /**
   * Start a drag.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns If update was successful.
   */
  private dragStart(x: number, y: number): boolean {
    return this.dragUpdate(x, y, false);
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
    x: number,
    y: number,
    checkSelectRange: boolean = true
  ): boolean {
    const boardRenderer = this.entity.getGame().getBoardRenderer();

    const tile = boardRenderer.getTileWorld(x, y);
    if (tile === null) return false;

    if (checkSelectRange) {
      const tileSize = boardRenderer.getTileSize();
      const tilePosition = boardRenderer.alignToGrid(x, y);
      if (tilePosition === null) return false;

      if (Math.abs(x - tilePosition.x) > tileSize.x / 3) return false;
      if (Math.abs(y - tilePosition.y) > tileSize.y / 3) return false;
    }

    this.select(tile.x, tile.y);

    return true;
  }

  /**
   * End a drag and match.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  private dragFinish(x: number, y: number): boolean {
    this.dragUpdate(x, y, false);

    this.match();

    return true;
  }
}
