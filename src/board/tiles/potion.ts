import Phaser from "phaser";
import { Tile } from ".";
import { Board } from "..";
import { TileRenderer } from "./renderer";
import { Entity } from "../../entities/entity";

export class Potion extends Tile {
    public constructor(scene: Phaser.Scene, board: Board, x: number, y: number) {
        super(scene, {
            board,
            gridPosition: new Phaser.Math.Vector2(x, y),
            key: "potion"
        });
        this.addRenderer(new TileRenderer(this));
    }

    protected performActionInner(count: number, entity: Entity, _otherEntities: Entity[]): boolean {
        entity.strength += count;

        return true;
    }
}
