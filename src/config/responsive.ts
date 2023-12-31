import Phaser from "phaser";

export const REPONSIVE_SIZES = ["small", "medium"] as const;
export type ResponsiveSize = typeof REPONSIVE_SIZES[number];

export interface ResponsiveConfig {
    readonly name: ResponsiveSize;
    readonly stroke: number;
    readonly textSize: number;
    readonly boardSize: number;
    readonly tileSize: number;
    readonly monsterOffset: Phaser.Math.Vector2;
    readonly gridOffset: Phaser.Math.Vector2;
};

export const RESPONSIVE_MIN_SIZE: [ResponsiveSize, number][] = [
    ["small", 0],
    ["medium", 800]
] as const;

export const RESPONSIVE_CONFIGS: { [key in ResponsiveSize]: ResponsiveConfig } = {
    small: {
        name: "small",
        stroke: 15,
        boardSize: 324,
        textSize: 24,
        tileSize: 48,
        gridOffset: new Phaser.Math.Vector2(0.5, 0.75),
        monsterOffset: new Phaser.Math.Vector2(0.5, 0.25)
    },
    medium: {
        name: "medium",
        stroke: 25,
        textSize: 48,
        boardSize: 600,
        tileSize: 88,
        gridOffset: new Phaser.Math.Vector2(0.25, 0.5),
        monsterOffset: new Phaser.Math.Vector2(0.75, 0.5)
    }
} as const;
