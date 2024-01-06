import { AI } from ".";
import { Entity } from "../entities";

export class PathAI extends AI {
  protected lineFromTileKeyLongestPath(
    _entity: Entity,
    tileLongestPath: Record<number, Phaser.Math.Vector2[]>
  ): Phaser.Math.Vector2[] {
    return Object.values(tileLongestPath).reduce(
      (prev, next) => (next.length > prev.length ? next : prev),
      []
    );
  }

  public nextLine(entity: Entity): Phaser.Types.Math.Vector2Like[] {
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
