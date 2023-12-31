import Phaser from "phaser";
import { PointLine } from "../gfx/line";
import { Entity } from "./entity";

export class EntityRenderer extends Phaser.GameObjects.Container {
    private entity: Entity;
    private line: PointLine;

    public constructor(entity: Entity) {
        super(entity.scene);

        this.entity = entity;

        this.line = new PointLine(entity.scene, this.entity.getStroke(), this.entity.getFill());
        this.add(this.line);
    }

    public pushPoint(x: number, y: number) {
        const tile = this.entity.getBoard().getTile(x, y);
        if (tile === null) return;

        const tilePosition = tile.getWorldPosition(); 

        this.line.pushPoint(tilePosition.x, tilePosition.y);
    }

    public popPoint() {
        this.line.popPoint();
    }

    public clearPoints() {
        this.line.clearPoints();
    }
}
