import Phaser from "phaser";

import { Controller } from ".";
import { Entity } from "../entities";

export class PointerController extends Controller {
    public constructor(scene: Phaser.Scene, entity: Entity) {
        super(scene, entity);

        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.dragFinish(pointer.worldX, pointer.worldY));
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.dragStart(pointer.worldX, pointer.worldY));
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => pointer.isDown && this.dragUpdate(pointer.worldX, pointer.worldY));
    }

    private dragStart(x: number, y: number): boolean {
        return this.dragUpdate(x, y, false);
    }

    private dragUpdate(x: number, y: number, checkSelectRange: boolean = true): boolean {
        const boardRenderer = this.entity.getGame().getBoardRenderer();

        const tile = boardRenderer.getTileWorld(x, y);
        if (tile === null) return false;

        if (checkSelectRange) {
            const tileSize = boardRenderer.getTileSize();
            const tilePosition = boardRenderer.alignToGrid(x, y);
            if (tilePosition === null) return false;

            if (Math.abs(x - tilePosition.x) > tileSize.x / 3) return false;
            if (Math.abs(y - tilePosition.y) > tileSize.y / 3) return false;
        }

        this.select(tile.x, tile.y);

        return true;
    }

    private dragFinish(x: number, y: number): boolean {
        this.dragUpdate(x, y, false);

        this.match();

        return true;
    }
}
