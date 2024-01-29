import { Entity, Game, Match } from "match-game";

import { TILE_FRAME_KEY } from "./config";
import { TileKey } from "./config";
import { ValueKey } from "./types";

/**
 * Sample matching algorithm + action for {@link Game}.
 *
 * This currently check that all types selected are the same and performs actions related to that.
 */
export class SampleMatch extends Match<ValueKey> {
  public constructor(
    game: Game<ValueKey>,
    private minLineLength: number = 1,
    private maxLineLength: number = Infinity
  ) {
    super(game);
  }

  /**
   * Check that {@link point} is vertically, horizontally, or diagonally next to {@link other}.
   */
  private checkNextTo(
    point: Phaser.Types.Math.Vector2Like,
    other: Phaser.Types.Math.Vector2Like
  ): boolean {
    if (point.x === undefined || point.y === undefined) return false;
    if (other.x === undefined || other.y === undefined) return false;

    return Math.abs(point.x - other.x) <= 1 && Math.abs(point.y - other.y) <= 1;
  }

  public canAdd(
    x: number,
    y: number,
    line: Phaser.Types.Math.Vector2Like[]
  ): boolean {
    // If line is empty, tile type is unknown therefore we set it by starting the line.
    if (line.length === 0) return true;

    // Check that the line is not too long.
    if (line.length > this.maxLineLength) return false;

    // Check that current point is next to previous point.
    const lastPoint = line[line.length - 1];
    if (!this.checkNextTo({ x, y }, lastPoint)) return false;

    /**
     * Check that added tile type matches previous tile type.
     */

    const board = this.getGame().getBoard();

    const lastTile = board.getTile(lastPoint.x ?? -1, lastPoint.y ?? -1);
    if (lastTile === null) return false;

    const lastKey = lastTile.key;
    const pointKey = board.getTile(x, y)?.key;

    return (
      pointKey !== undefined && lastKey !== undefined && pointKey === lastKey
    );
  }

  public canMatch(line: Phaser.Types.Math.Vector2Like[]): boolean {
    /**
     * {@link canAdd} validates the same type condition, therefore just check that the line is long enough.
     **/
    return line.length >= this.minLineLength;
  }

  public match(entity: Entity<ValueKey>): void {
    const board = this.getGame().getBoard();
    const line = entity.getLine();

    /**
     * Find tile name and perform action.
     */

    const lastPoint = line[line.length - 1];
    const lastKey = board.getTile(lastPoint.x ?? -1, lastPoint.y ?? -1)?.key;
    if (lastKey === undefined) return;

    const name = TILE_FRAME_KEY[lastKey];
    if (name === undefined) return;

    this.action(name, entity);
  }

  /**
   * Perform action related to tile {@link name} on {@link entity}.
   */
  private action(name: TileKey, entity: Entity<ValueKey>) {
    const line = entity.getLine();
    const count = line.length;

    const otherEntities = entity.getGame().getOtherEntities(entity);

    switch (name) {
      case "attack":
        // Decrease score of other entities by line length.
        otherEntities.forEach((other) =>
          other.setValue("score", Math.max(other.getValue("score") - count, 0))
        );
        break;
      case "gold":
        // Increase score of current entity by line length.
        entity.setValue("score", entity.getValue("score") + count);
        break;
      case "empty":
        break;
    }
  }
}
