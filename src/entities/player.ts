import Phaser from "phaser";

export abstract class Player extends Phaser.GameObjects.Container {
    protected isTurn: boolean = false;

    public onDragStart: ((x: number, y: number) => void) | null = null;
    public onDragMove: ((x: number, y: number) => void) | null = null;
    public onDragStop: ((x: number, y: number) => void) | null = null;

    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    protected dragStart(x: number, y: number): void {
        if (this.isTurn) this.onDragStart?.(x, y);
    }

    protected dragMove(x: number, y: number): void {
        if (this.isTurn) this.onDragMove?.(x, y);
    }

    protected dragStop(x: number, y: number): void {
        if (this.isTurn) this.onDragStop?.(x, y);
    }

    public turnStart(): void {
        this.isTurn = true;

        this.turnStartInner();
    }

    protected abstract turnStartInner(): void;

    public turnEnd(): void {
        this.isTurn = false;

        this.turnEndInner();
    }

    protected abstract turnEndInner(): void;
}
