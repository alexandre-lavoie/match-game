import { Entity, PathAI } from "match-game";

import {
  MIN_LINE_LENGTH,
  TILE_CONFIGS,
  TILE_FRAME_KEY,
  TileKey,
} from "./config";
import { ValueKey } from "./types";

export class SampleAI extends PathAI<ValueKey> {
  protected lineFromTileKeyLongestPath(
    _entity: Entity<ValueKey>,
    map: Record<number, Phaser.Math.Vector2[]>
  ): Phaser.Math.Vector2[] {
    /**
     * Map of length of line per tile type.
     */
    const lengths = Object.fromEntries(
      Object.entries(TILE_CONFIGS).map(
        ([key, { frame }]) => [key, map[frame]?.length ?? 0] as const
      )
    ) as Record<TileKey, number>;

    /**
     * Map of formulas to determine the score of each tile.
     *
     * The higher the score, the more likely a line is selected.
     */
    const scores: Record<TileKey, number> = {
      attack: lengths.attack,
      empty: 0,
      gold: lengths.gold,
    };

    /**
     * Find best line according to {@link scores}
     */

    const sortedTileIndex = Object.entries(scores)
      .sort(([_, s0], [__, s1]) => s1 - s0)
      .map(([name, _]) => name)
      .map((name) => TILE_CONFIGS[name as TileKey].frame);

    const bestTileIndex = sortedTileIndex.find((key) => map[key] !== undefined);
    if (bestTileIndex === undefined) return [];

    /**
     * Modify line depending on tile type.
     */

    const bestTileKey = TILE_FRAME_KEY[bestTileIndex];
    const bestLine = map[bestTileIndex];

    const modifyLine: Record<
      TileKey,
      (line: Phaser.Math.Vector2[]) => Phaser.Math.Vector2[]
    > = {
      attack: (line) => line,
      empty: (line) => line.slice(0, MIN_LINE_LENGTH),
      gold: (line) => line,
    };

    return modifyLine[bestTileKey](bestLine);
  }
}
