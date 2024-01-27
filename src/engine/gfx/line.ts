import Phaser from "phaser";

/**
 * A multi-point line.
 *
 * Essentially, a better {@link Phaser.GameObjects.Line}
 */
export class PointLine extends Phaser.GameObjects.Container {
  private stroke: number;
  private fill: number;

  private points: Phaser.Math.Vector2[] = [];

  private circles: Phaser.GameObjects.Ellipse[] = [];
  private segments: Phaser.GameObjects.Line[] = [];

  public constructor(
    scene: Phaser.Scene,
    stroke: number = 1,
    fill: number = 0
  ) {
    super(scene, 0, 0);

    this.stroke = stroke;
    this.fill = fill;
  }

  /**
   * Check if line is empty.
   */
  public isEmpty(): boolean {
    return this.points.length === 0;
  }

  /**
   * Get x, y coordinate at offset in {@link points}.
   *
   * @param index
   * @returns x, y coordinate or undefined if out of bounds.
   */
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

  /**
   * Get last point of {@link points}.
   */
  public get lastPoint(): Phaser.Math.Vector2 | null {
    return this.points[this.points.length - 1] ?? null;
  }

  /**
   * Remove all points from {@link points}.
   */
  public clearPoints(): void {
    while (this.popPoint());
  }

  /**
   * Check if {@link points} contains {@link x}, {@link y} coordinate.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns Is contained.
   */
  public containsPoint(x: number, y: number): boolean {
    return this.points.some((point) => point.x == x && point.y == y);
  }

  /**
   * Add {@link x}, {@link y} at end of {@link points}.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  public pushPoint(x: number, y: number): void {
    const point = new Phaser.Math.Vector2(x, y);
    this.points.push(point);

    this.pushCircle(point.x, point.y);

    if (this.points.length <= 1) return;
    const lastPoint = this.points[this.points.length - 2];
    this.pushSegment(lastPoint.x, lastPoint.y, point.x, point.y);
  }

  /**
   * Remove x, y coordinate from end of {@link points}.
   *
   * @returns x, y coordinate or undefined if {@link points} is empty.
   */
  public popPoint(): Phaser.Math.Vector2 | undefined {
    const point = this.points.pop();

    this.popCircle();
    this.popSegment();

    return point;
  }

  /**
   * Add {@link Phaser.GameObjects.Ellipse} at {@link x}, {@link y} coordinate at end of {@link circles}.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  private pushCircle(x: number, y: number): void {
    const circle = new Phaser.GameObjects.Ellipse(
      this.scene,
      x,
      y,
      this.stroke,
      this.stroke,
      this.fill
    );

    this.circles.push(circle);
    this.add(circle);
  }

  /**
   * Remove {@link Phaser.GameObjects.Ellipse} from end of {@link circles}.
   */
  private popCircle(): void {
    const circle = this.circles.pop();
    if (circle === undefined) return;

    this.remove(circle, true);
  }

  /**
   * Add {@link Phaser.GameObjects.Line} to end of {@link segments}.
   *
   * @param x1 start coordinate.
   * @param y1 start coordinate.
   * @param x2 end coordinate.
   * @param y2 end coordinate.
   */
  private pushSegment(x1: number, y1: number, x2: number, y2: number): void {
    const line = new Phaser.GameObjects.Line(
      this.scene,
      0,
      0,
      x1,
      y1,
      x2,
      y2,
      this.fill
    );
    line.setOrigin(0);
    line.setLineWidth(this.stroke);

    this.segments.push(line);
    this.add(line);
  }

  /**
   * Remove {@link Phaser.GameObjects.Line} from end of {@link segments}.
   */
  private popSegment(): void {
    const segment = this.segments.pop();
    if (segment === undefined) return;

    this.remove(segment, true);
  }
}
