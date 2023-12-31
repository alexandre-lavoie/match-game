import Phaser from "phaser";
import { TileRenderer } from "./renderer";
import { Board } from "..";
import { TileKey } from "../../config/tile";
import { TILE_DEPTH } from "../../config/game";
import { Entity } from "../../entities/entity";

export interface TileConfig {
    readonly board: Board;
    readonly gridPosition: Phaser.Math.Vector2;
    readonly key: TileKey;
    readonly renderer?: TileRenderer;
};

export abstract class Tile extends Phaser.GameObjects.Container {
    private board: Board;
    private key: TileKey;
    private gridPosition: Phaser.Math.Vector2;
    private renderer?: TileRenderer; 

    public constructor(scene: Phaser.Scene, config: TileConfig) {
        const tileSize = config.board.getTileSize();

        super(
            scene, 
            config.gridPosition.x * tileSize.x + tileSize.x / 2,
            config.gridPosition.y * tileSize.y + tileSize.y / 2
        )

        this.setDepth(TILE_DEPTH);

        this.board = config.board;

        this.key = config.key;

        this.gridPosition = config.gridPosition;
    }

    public getWorldPosition(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(
            this.x + this.board.x,
            this.y + this.board.y
        );
    }

    public addRenderer(renderer: TileRenderer): this {
        this.renderer = renderer;
        this.add(this.renderer);

        return this;
    }

    public getBoard(): Board {
        return this.board;
    }

    public getKey(): TileKey {
        return this.key;
    }

    public performAction(count: number, entity: Entity, otherEntities: Entity[]): boolean {
        this.renderer?.action();

        return this.performActionInner(count, entity, otherEntities);
    }

    protected abstract performActionInner(count: number, entity: Entity, otherEntities: Entity[]): boolean;

    public canMatch(other: Tile): boolean {
        return this.key === other.key;
    }

    public isAdjacent(other: Tile): boolean {
        return Math.abs(this.gridPosition.x - other.gridPosition.x) <= 1 && Math.abs(this.gridPosition.y - other.gridPosition.y) <= 1;
    }

    public getGridPoint(): Phaser.Math.Vector2 {
        return this.gridPosition;
    }

    public spawn(delay: number = 0) {
        this.renderer?.spawn(delay);
    }

    public drop(y: number, delay: number = 0) {
        this.gridPosition.y = y;

        const tileSize = this.board.getTileSize();

        const fromY = this.y;
        this.y = y * tileSize.y + tileSize.y / 2;

        this.renderer?.drop(fromY, this.y, delay);
    }

    public select(offset: number = 0) {
        this.renderer?.select(offset);
    }

    public match(offset: number = 0) {
        this.renderer?.match(offset);
    }
}
