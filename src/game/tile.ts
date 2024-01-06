export interface TileConfig {
  readonly probability: number;
}

export const TILE_KEYS = [
  "attack",
  "defense",
  "heart",
  "drop",
  "strength",
] as const;
export type TileKey = (typeof TILE_KEYS)[number];

export const TILE_CONFIGS: TileConfig[] = [
  {
    probability: 20,
  },
  {
    probability: 20,
  },
  {
    probability: 5,
  },
  {
    probability: 1,
  },
  {
    probability: 20,
  },
] as const;
