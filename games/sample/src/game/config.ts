import type { Board, EntityLineRenderer, Match } from "match-game";

import type { SampleGame } from "./game";

/**
 * Line width of the {@link EntityLineRenderer}.
 */
export const STROKE_WIDTH = 20;

/**
 * Size of fonts in pixels.
 */
export const FONT_SIZE = 16;

/**
 * Score to win game.
 */
export const WIN_SCORE = 30;

/**
 * Number of entities playing.
 */
export const ENTITY_COUNT = 2;

/**
 * Width of {@link Board} in {@link SampleGame}.
 */
export const GRID_WIDTH = 6;

/**
 * Height of {@link Board} in {@link SampleGame}.
 */
export const GRID_HEIGHT = 6;

/**
 * Minimum length of line for {@link Match}.
 */
export const MIN_LINE_LENGTH = 3;

/**
 * Config for {@link Board} tiles.
 */
export interface TileConfig {
  frame: number;
  probability: number;
}

/**
 * Map of {@link TileConfig}.
 */
export const TILE_CONFIGS = {
  attack: {
    frame: 0,
    probability: 1,
  },
  empty: {
    frame: 1,
    probability: 2,
  },
  gold: {
    frame: 3,
    probability: 2,
  },
} as const satisfies Record<string, TileConfig>;

/**
 * Keys of {@link TILE_CONFIGS}.
 */
export type TileKey = keyof typeof TILE_CONFIGS;

/**
 * Map to convert from a frame index to a tile key.
 */
export const TILE_FRAME_KEY: Record<number, TileKey> = Object.fromEntries(
  Object.entries(TILE_CONFIGS).map(([key, { frame }]) => [frame, key] as const)
) as any;
