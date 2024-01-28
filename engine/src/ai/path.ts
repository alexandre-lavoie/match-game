import { Entity } from "../entities/entity";
import { AI } from "./ai";

/**
 * An implementation of AI that uses a greedy breath-first search to determine the longest lines per tile type.
 */
export class PathAI<TValueKey extends string = string> extends AI<TValueKey> {
  /**
   * Calculate the best line based on the longest paths per tile.
   *
   * DO OVERRIDE this method to implement your own AI logic based on longest lines.
   *
   * @param _entity to calculate line for.
   * @param tileLongestPath map between a tile index and the longest line found for that tile index.
   * @returns list of points that defines the line.
   */
  protected lineFromTileKeyLongestPath(
    _entity: Entity<TValueKey>,
    tileLongestPath: Record<number, Phaser.Math.Vector2[]>
  ): Phaser.Math.Vector2[] {
    return Object.values(tileLongestPath).reduce(
      (prev, next) => (next.length > prev.length ? next : prev),
      []
    );
  }

  public nextLine(entity: Entity<TValueKey>): Phaser.Types.Math.Vector2Like[] {
    const gridSize = entity.getGame().getBoard().getSize();

    let tileLongestPath: Record<number, Phaser.Math.Vector2[]> = {};
    for (let x = 0; x < gridSize.x; x++) {
      for (let y = 0; y < gridSize.y; y++) {
        const path = this.searchPath(entity, x, y);
        if (path.length === 0) continue;

        const point = path[path.length - 1];
        const tile = entity.getGame().getBoard().getTile(point.x, point.y);
        if (tile === null) continue;

        if (path.length > (tileLongestPath[tile.key]?.length ?? 0))
          tileLongestPath[tile.key] = path;
      }
    }

    return this.lineFromTileKeyLongestPath(entity, tileLongestPath);
  }

  /**
   * Search for the longest path at {@link x}, {@link y}.
   *
   * @param entity to apply search on. Mosly only used to access the game state.
   * @param x coordinate.
   * @param y coordinate.
   * @returns list of points that defines the line. An empty list implies that no path was found.
   */
  private searchPath(
    entity: Entity,
    x: number,
    y: number
  ): Phaser.Math.Vector2[] {
    const game = entity.getGame();

    let queue = [[new Phaser.Math.Vector2(x, y)]];
    let longestPath: Phaser.Math.Vector2[] = [];

    while (queue.length > 0) {
      const path = queue.pop()!;

      if (path.length < longestPath.length) continue;

      const point = path.pop()!;

      if (!game.hasMatch(point.x, point.y, path)) continue;

      path.push(point);

      if (game.getMatch(path)) longestPath = path;

      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const nextPoint = new Phaser.Math.Vector2(point.x + i, point.y + j);

          if (path.some((p) => p.x === nextPoint.x && p.y === nextPoint.y))
            continue;

          queue.push([...path, nextPoint]);
        }
      }
    }

    return longestPath;
  }
}
