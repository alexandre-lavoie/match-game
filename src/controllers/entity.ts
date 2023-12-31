import Phaser from "phaser";
import { Board } from "../board";
import { Entity } from "../entities/entity";

export interface EntityControllerCallbacks {
    select?: (x: number, y: number) => boolean;
    match?: () => boolean;
};

export abstract class EntityController {
    protected entity: Entity;

    protected scene: Phaser.Scene;
    protected board: Board;

    private callbacks: EntityControllerCallbacks;

    public constructor(entity: Entity, callbacks: EntityControllerCallbacks) {
        this.entity = entity;

        this.scene = entity.scene;
        this.board = entity.getBoard();

        this.callbacks = callbacks;
    }

    private check<T>(fn: T | undefined): fn is T {
        if (!fn) return false;

        return true;
    }

    public tick(_delay: number = 0): void {}

    protected select(x: number, y: number): boolean {
        if (!this.check(this.callbacks.select)) return false;

        return this.callbacks.select(x, y);
    }

    protected match(): boolean {
        if (!this.check(this.callbacks.match)) return false;

        return this.callbacks.match();
    }
}
