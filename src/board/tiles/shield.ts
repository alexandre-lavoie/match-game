import Phaser from "phaser";
import { Tile } from ".";
import { Board } from "..";
import { TileRenderer } from "./renderer";
import { Entity } from "../../entities/entity";

export class Shield extends Tile {
    public constructor(scene: Phaser.Scene, board: Board, x: number, y: number) {
        super(scene, {
            board,
            gridPosition: new Phaser.Math.Vector2(x, y),
            key: "shield"
        });
        this.addRenderer(new TileRenderer(this));
    }

    protected performActionInner(count: number, entity: Entity, _otherEntities: Entity[]): boolean {
        entity.defense += count;

        return true;
    }
}
