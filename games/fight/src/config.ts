export const GRID_SIZE = 6;
export const MIN_LINE_LENGTH = 3;
export const MAX_HEALTH = 100;

export const RESIZE_RANGES = {
  small: [0, 700] as const,
  medium: [700, 1200] as const,
  large: [1200, Infinity] as const,
} as const;
