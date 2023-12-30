import Phaser from "phaser";
import { Player } from "./player";

export class Human extends Player {
    private started: boolean = false;

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (!this.started) return;
            
            this.dragStop(pointer.worldX, pointer.worldY);
            this.started = false;
        });
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.started = true;
            this.dragStart(pointer.worldX, pointer.worldY)
        });
        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (!this.isTurn) return;
            if (!pointer.isDown) return;

            if (!this.started) {
                this.started = true;
                this.dragStart(pointer.worldX, pointer.worldY);
            }

            this.dragMove(pointer.worldX, pointer.worldY);
        });
    }

    public turnStartInner(): void {
        this.started = false;
    }

    public turnEndInner(): void {
        this.started = false;
    }
}
