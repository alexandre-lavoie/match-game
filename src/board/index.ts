import Phaser from "phaser";
import { Tile } from "./tiles";
import { ProbabilityMap } from "../math";
import { TileKey } from "../config/tile";
import { BACKGROUND_DEPTH } from "../config/game";
import { TileFactory } from "./tiles/factory";

export interface BoardConfig {
    readonly probabilityMap: ProbabilityMap<TileKey>;
    readonly gridSize: Phaser.Math.Vector2;
};

export class Board extends Phaser.GameObjects.Container {
    private tiles: (Tile | null)[][];

    private gridSize: Phaser.Math.Vector2;
    private tileSize: Phaser.Math.Vector2;

    private probabilityMap: ProbabilityMap<TileKey>;

    public constructor(scene: Phaser.Scene, x: number, y: number, config: BoardConfig) {
        super(scene, x, y);

        this.probabilityMap = config.probabilityMap;

        const board = new Phaser.GameObjects.Sprite(scene, 0, 0, "board");
        board.setOrigin(0);
        board.setDepth(BACKGROUND_DEPTH);
        this.add(board);

        this.gridSize = config.gridSize;

        this.tileSize = new Phaser.Math.Vector2(
            board.width / this.gridSize.x,
            board.height / this.gridSize.y
        );

        this.tiles = this.makeGrid();
    }

    private makeTile(x: number, y: number): Tile {
        const tile = TileFactory.fromKey(
            this.scene,
            this,
            this.probabilityMap.random(),
            x,
            y
        );
        this.add(tile);

        return tile;
    }

    private makeGrid(): Tile[][] {
        const grid = new Array(this.gridSize.x).fill(0).map(_ => new Array(this.gridSize.y).fill(0));
        return grid.map((col, x) => col.map((_, y) => this.makeTile(x, y)));
    }

    public match(points: Phaser.Types.Math.Vector2Like[]): (Tile | null)[] {
        return points.map((point, i) => {
            if (point.x === undefined || point.y === undefined) return null;

            const tile = this.getTile(point.x, point.y);
            if (!tile) return null;

            tile.match(i);

            this.tiles[point.x][point.y] = null;

            return tile;
        });
    }

    public drop(delay: number = 0) {
        const indices = this.tiles.map((col) => col.reduce((prev, tile, i) => tile === null ? i : prev, -1));

        indices.forEach((my, x) => {
            let i = my;
            for (let y = my - 1; y >= 0; y--) {
                const tile = this.getTile(x, y);
                if (tile === null) continue;

                const ny = i--;

                this.tiles[x][y] = null;
                this.tiles[x][ny] = tile;

                tile.drop(ny, delay);
            }
        });
    }

    public fill(delay: number = 0) {
        const indices = this.tiles.map((col) => col.reduce((prev, tile, i) => tile === null ? i : prev, -1));

        indices.forEach((my, x) => {
            for (let y = 0; y <= my; y++) {
                const tile = this.makeTile(x, y);
                this.tiles[x][y] = tile;

                tile.spawn(delay);
            }
        });
    }

    public getTile(x: number, y: number): Tile | null {
        return this.tiles[x]?.[y] ?? null;
    }

    public getTileWorld(x: number, y: number): Tile | null {
        let offsetPoint = new Phaser.Math.Vector2(x - this.x, y - this.y);
        if (offsetPoint.x < 0 || offsetPoint.y < 0) return null;
        if (offsetPoint.x > this.gridSize.x * this.tileSize.x || offsetPoint.y > this.gridSize.y * this.tileSize.y) return null;

        const gridPoint = new Phaser.Math.Vector2(Math.floor(offsetPoint.x / this.tileSize.x), Math.floor(offsetPoint.y / this.tileSize.y));

        return this.getTile(gridPoint.x, gridPoint.y);
    }

    public getGridSize(): Phaser.Math.Vector2 {
        return this.gridSize;
    }

    public getTileSize(): Phaser.Math.Vector2 {
        return this.tileSize;
    }
}
