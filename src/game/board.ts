import Phaser from "phaser";
import { Tile } from "./tile";

export class Board extends Phaser.GameObjects.Container {
    public static readonly MIN_LINE_LENGTH = 3;

    private size: number;
    private grid: number[][];
    private tiles: Tile[][];

    constructor(scene: Phaser.Scene, x: number, y: number, size: number) {
        super(scene, x, y);

        this.size = size;
        this.grid = new Array(this.size).fill(0).map(_ => new Array(this.size).fill(0).map(_ => Math.floor(Math.random() * Tile.KEYS.length)));
        this.tiles = this.grid.map((row, i) => row.map((tile, j) => new Tile(
            scene, i * Tile.SIZE + Tile.SIZE / 2, 
            j * Tile.SIZE + Tile.SIZE / 2, Tile.KEYS[tile])
        ));

        const board = new Phaser.GameObjects.Sprite(scene, 0, 0, "board");
        board.setOrigin(0);

        this.add([
            board,
            ...this.tiles.flatMap(row => row.flatMap(tile => tile))
        ]);
    }

    public match(points: Phaser.Math.Vector2[]): number[] {
        return points.map(point => this.getTilePoint(point.x, point.y)).map((tilePoint) => {
            if (!tilePoint) return -1;

            const tileId = this.grid[tilePoint.x][tilePoint.y];

            this.grid[tilePoint.x][tilePoint.y] = Math.floor(Math.random() * Tile.KEYS.length);

            return tileId;
        });
    }

    public matchAnimate(points: Phaser.Math.Vector2[]) {
        points.map(point => this.getTilePoint(point.x, point.y)).forEach((tilePoint, i) => {
            if (!tilePoint) return;

            this.tiles[tilePoint.x][tilePoint.y].textureAnimate(
                this.grid[tilePoint.x][tilePoint.y], 
                i
            );
        });
    }

    public getTile(x: number, y: number): Tile | null {
        const tilePoint = this.getTilePoint(x, y);
        if (tilePoint === null) return null;

        return this.tiles[tilePoint.x][tilePoint.y];
    }

    public getTiles(): Tile[][] {
        return this.tiles;
    }

    public getTileSize(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            Tile.SIZE * this.scaleX,
            Tile.SIZE * this.scaleY
        );
    }

    private getTilePoint(x: number, y: number): Phaser.Math.Vector2 | null {
        const tileSize = this.getTileSize();

        let offsetPoint = new Phaser.Math.Vector2(x - this.x, y - this.y);
        if (offsetPoint.x < 0 || offsetPoint.y < 0) return null;
        if (offsetPoint.x > this.size * tileSize.x || offsetPoint.y > this.size * tileSize.y) return null;

        return new Phaser.Math.Vector2(
            Math.floor(offsetPoint.x / (Tile.SIZE * this.scaleX)), 
            Math.floor(offsetPoint.y / (Tile.SIZE * this.scaleY))
        );
    } 

    public alignPoint(x: number, y: number): Phaser.Math.Vector2 | null {
        const tilePoint = this.getTilePoint(x, y);
        if (tilePoint === null) return null;

        let worldPoint = new Phaser.Math.Vector2(
            this.x + tilePoint.x * Tile.SIZE * this.scaleX + Tile.SIZE * this.scaleX / 2, 
            this.y + tilePoint.y * Tile.SIZE * this.scaleY + Tile.SIZE * this.scaleY / 2
        );
        return worldPoint;
    }

    public getTileIds(): number[][] {
        return this.grid;
    }

    public getTileId(x: number, y: number): number | null {
        const tilePoint = this.getTilePoint(x, y);
        if (tilePoint === null) return null;

        return this.grid[tilePoint.x][tilePoint.y];
    }
}
