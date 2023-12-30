import Phaser from "phaser";

export class PointLine extends Phaser.GameObjects.Container {
    private stroke: number;
    private fill: number;

    private points: Phaser.Math.Vector2[] = [];

    private circles: Phaser.GameObjects.Ellipse[] = [];
    private segments: Phaser.GameObjects.Line[] = [];

    constructor(scene: Phaser.Scene, stroke: number = 1, fill: number = 0) {
        super(scene, 0, 0);

        this.stroke = stroke;
        this.fill = fill;
    }

    public isEmpty(): boolean {
        return this.points.length === 0;
    }

    public getPoint(index: number): Phaser.Math.Vector2 | undefined {
        if (index < 0) {
            return this.points[this.points.length + index];
        } else {
            return this.points[index];
        }
    }

    public getPoints(): Phaser.Math.Vector2[] {
        return this.points;
    }

    public get lastPoint(): Phaser.Math.Vector2 | null {
        return this.points[this.points.length - 1] ?? null;
    }

    public clearPoints() {
        while (this.popPoint());
    }

    public containsPoint(x: number, y: number): boolean {
        return this.points.some(point => point.x == x && point.y == y);
    }

    public pushPoint(x: number, y: number) {
        const point = new Phaser.Math.Vector2(x, y);
        this.points.push(point);

        this.pushCircle(point.x, point.y);

        if (this.points.length <= 1) return;
        const lastPoint = this.points[this.points.length - 2];
        this.pushSegment(lastPoint.x, lastPoint.y, point.x, point.y);
    }

    public popPoint(): Phaser.Math.Vector2 | undefined {
        const point = this.points.pop();

        this.popCircle();
        this.popSegment();

        return point;
    }

    private pushCircle(x: number, y: number) {
        const circle = new Phaser.GameObjects.Ellipse(this.scene, x, y, this.stroke, this.stroke, this.fill);

        this.circles.push(circle);
        this.add(circle);
    }

    private popCircle() {
        const circle = this.circles.pop();
        if (circle === undefined) return;

        this.remove(circle, true);
    }

    private pushSegment(x1: number, y1: number, x2: number, y2: number) {
        const line = new Phaser.GameObjects.Line(this.scene, 0, 0, x1, y1, x2, y2, this.fill);
        line.setOrigin(0);
        line.setLineWidth(this.stroke);

        this.segments.push(line);
        this.add(line);
    }

    private popSegment() {
        const segment = this.segments.pop();
        if (segment === undefined) return;

        this.remove(segment, true);
    }
}
