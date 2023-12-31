import Phaser from "phaser";
import { EntityController, EntityControllerCallbacks } from "./entity";
import { Entity } from "../entities/entity";

export class PointerController extends EntityController {
    public constructor(entity: Entity, callbacks: EntityControllerCallbacks) {
        super(entity, callbacks);

        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.finish(pointer.worldX, pointer.worldY));
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.start(pointer.worldX, pointer.worldY));
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => (pointer.isDown) ? this.update(pointer.worldX, pointer.worldY) : null);
    }

    private start(x: number, y: number): boolean {
        return this.update(x, y, false);
    }

    private update(x: number, y: number, checkSelectRange: boolean = true): boolean {
        const tile = this.board.getTileWorld(x, y);
        if (tile === null) return false;

        if (checkSelectRange) {
            const tileSize = this.board.getTileSize();
            const tilePosition = tile.getWorldPosition();

            if (Math.abs(x - tilePosition.x) > tileSize.x / 3) return false;
            if (Math.abs(y - tilePosition.y) > tileSize.y / 3) return false;
        }

        const gridPoint = tile.getGridPoint();
        return this.select(gridPoint.x, gridPoint.y);
    }

    private finish(x: number, y: number): boolean {
        this.update(x, y, false);

        return this.match();
    }
}
