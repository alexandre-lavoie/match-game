import Phaser from "phaser";
import { BoardRenderer } from "./renderer";

export class BoardSound extends Phaser.GameObjects.Container {
    private boardRenderer: BoardRenderer;

    public constructor(scene: Phaser.Scene, boardRenderer: BoardRenderer) {
        super(scene);

        this.boardRenderer = boardRenderer;
        this.attachCallbacks();
    }

    private attachCallbacks() {
        this.boardRenderer
            .onSelect(this.select, this)
            .onCollect(this.collect, this);
    }

    protected select(_x: number, _y: number, offset: number) {
        this.scene.sound.play("select", {
            rate: 1 + offset * 0.1
        });
    }

    protected collect(_x: number, _y: number, offset: number) {
        this.scene.sound.play("collect", {
            rate: 1 + offset * 0.1
        });
    }
}
