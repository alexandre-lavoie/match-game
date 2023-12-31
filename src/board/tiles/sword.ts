import Phaser from "phaser";
import { Tile } from ".";
import { Board } from "..";
import { TileRenderer } from "./renderer";
import { Entity } from "../../entities/entity";

export class Sword extends Tile {
    public constructor(scene: Phaser.Scene, board: Board, x: number, y: number) {
        super(scene, {
            board,
            gridPosition: new Phaser.Math.Vector2(x, y),
            key: "sword"
        });
        this.addRenderer(new TileRenderer(this));
    }

    protected performActionInner(count: number, entity: Entity, otherEntities: Entity[]): boolean {
        otherEntities.forEach(other => {
            other.health -= Math.max(entity.strength - other.defense + count, 0);
        });

        return true;
    }
}
