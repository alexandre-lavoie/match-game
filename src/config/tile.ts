export const TILE_KEYS = ["sword", "shield", "heart", "gold", "potion"] as const;
export type TileKey = typeof TILE_KEYS[number];

export interface TileConfig {
    readonly frameIndex: number;
    readonly probability: number;
};

export const TILE_CONFIGS: { [key in TileKey]: TileConfig } = {
    sword: {
        frameIndex: 0,
        probability: 20
    },
    shield: {
        frameIndex: 1,
        probability: 10
    },
    heart: {
        frameIndex: 2,
        probability: 5
    },
    gold: {
        frameIndex: 3,
        probability: 1
    },
    potion: {
        frameIndex: 4,
        probability: 10
    }
} as const;
