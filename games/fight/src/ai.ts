import { MAX_HEALTH } from "./config";
import { TILE_KEYS, TileKey } from "./tile";

import { PathAI, Entity } from "match-game";

export class FightAI extends PathAI {
  protected lineFromTileKeyLongestPath(
    entity: Entity,
    map: Record<number, Phaser.Math.Vector2[]>
  ): Phaser.Math.Vector2[] {
    const game = entity.getGame();

    const thisStrength = entity.getValue("strength");
    const thisDefense = entity.getValue("defense");

    const others = game.getOtherEntities(entity);
    const otherStrength =
      others.reduce((prev, other) => prev + other.getValue("strength"), 0) /
      others.length;
    const otherDefense =
      others.reduce((prev, other) => prev + other.getValue("defense"), 0) /
      others.length;

    const lengths = Object.fromEntries(
      TILE_KEYS.map((key, i) => [key, map[i]?.length ?? 0] as const)
    ) as Record<TileKey, number>;

    const scores: Record<TileKey, number> = {
      attack: lengths.attack * (thisStrength / otherDefense),
      defense: lengths.defense * (otherStrength / thisDefense),
      heart: lengths.heart * (MAX_HEALTH / entity.getValue("health")),
      drop: Infinity,
      strength: lengths.strength * (otherDefense / thisStrength),
    };

    const sortedKeys = Object.entries(scores)
      .sort(([_, s0], [__, s1]) => s1 - s0)
      .map(([name, _]) => name)
      .map((name) => TILE_KEYS.indexOf(name as any));

    const key = sortedKeys.find((key) => map[key] !== undefined);
    if (key === undefined) return [];

    return map[key];
  }
}
