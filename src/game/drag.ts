import Phaser from "phaser";
import { PointLine } from "./line";

export class Drag extends Phaser.GameObjects.Container {
    public stroke: number;
    public fill: number;

    private tileId: number | null = null;
    private line: PointLine;
    private dragLine: Phaser.GameObjects.Line;
    private dragLineGeom: Phaser.Geom.Line;

    constructor(scene: Phaser.Scene, stroke: number = 1, fill: number = 0) {
        super(scene);

        this.stroke = stroke;
        this.fill = fill;

        this.dragLine = new Phaser.GameObjects.Line(scene, 0, 0, 0, 0, 0, 0, fill);
        this.dragLine.setVisible(false);
        this.dragLine.setOrigin(0);
        this.dragLine.setLineWidth(stroke);

        this.dragLineGeom = this.dragLine.geom;

        this.line = new PointLine(scene, stroke, fill);
        
        this.add([
            this.dragLine,
            this.line
        ]);
    }

    public get lastPoint(): Phaser.Math.Vector2 | null {
        return this.line.lastPoint;
    }

    public getPoints(): Phaser.Math.Vector2[] {
        return this.line.getPoints();
    }

    public start() {
        this.tileId = null;
        this.line.clearPoints();
        this.line.setVisible(true);
    }

    public update(x: number, y: number, tileId: number): boolean {
        const gridPoint = new Phaser.Math.Vector2(x, y);

        if (this.line.getPoint(-2)?.equals(gridPoint)) {
            this.line.popPoint();

            return true;
        }

        if (this.line.containsPoint(gridPoint.x, gridPoint.y)) return false;

        if (this.tileId !== null && tileId !== this.tileId) return false;
        this.tileId = tileId;

        this.line.pushPoint(gridPoint.x, gridPoint.y);

        return true;
    }

    public updateStart(): boolean {
        const lastPoint = this.line.lastPoint;
        if (!lastPoint) return false;

        this.dragLine.setVisible(true);

        this.dragLineGeom.x1 = lastPoint.x;
        this.dragLineGeom.y1 = lastPoint.y;

        return true;
    }

    public updateEnd(x: number, y: number) {
        this.dragLineGeom.x2 = x;
        this.dragLineGeom.y2 = y;
    }

    public stop() {
        this.line.setVisible(false);
        this.dragLine.setVisible(false);
    }
}
