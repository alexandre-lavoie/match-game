import Phaser from "phaser";
import { Tile } from ".";
import { Board } from "..";
import { TileRenderer } from "./renderer";
import { Entity } from "../../entities/entity";
import { MAX_HEALTH } from "../../config/game";

export class Gold extends Tile {
    public constructor(scene: Phaser.Scene, board: Board, x: number, y: number) {
        super(scene, {
            board,
            gridPosition: new Phaser.Math.Vector2(x, y),
            key: "gold"
        });
        this.addRenderer(new TileRenderer(this));
    }

    protected performActionInner(_count: number, entity: Entity, _otherEntities: Entity[]): boolean {
        entity.health = MAX_HEALTH;

        return true;
    }
}
