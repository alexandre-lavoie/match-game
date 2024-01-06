import Phaser from "phaser";
import { PointLine } from "../gfx/line";
import { Entity } from ".";

export class EntityLineRenderer extends Phaser.GameObjects.Container {
  private entity: Entity;
  private line: PointLine;

  private fill: number;
  private fontSize: number;

  public constructor(
    scene: Phaser.Scene,
    entity: Entity,
    stroke: number,
    fill: number,
    fontSize: number
  ) {
    super(scene);

    this.entity = entity;
    this.attachCallbacks();

    this.fill = fill;
    this.fontSize = fontSize;

    this.line = new PointLine(this.scene, stroke, fill);
    this.add(this.line);
  }

  private attachCallbacks() {
    this.entity
      .onPushPoint(this.pushPoint, this)
      .onPopPoint(this.popPoint, this)
      .onClearPoints(this.clearPoints, this);
  }

  protected drawCount(x: number, y: number) {
    let colorHex = this.fill.toString(16);
    colorHex = new Array(6 - colorHex.length).fill("0").join("") + colorHex;

    const text = new Phaser.GameObjects.Text(
      this.scene,
      x,
      y,
      this.line.getPoints().length.toString(),
      {
        color: `#${colorHex}`,
        font: `bold ${this.fontSize}px Arial`,
      }
    );
    this.add(text);

    this.scene.tweens.addCounter({
      from: 0,
      to: 10,
      duration: 500,
      onUpdate: (tween) => {
        text.setFontSize(30 + tween.getValue() * 2);
        text.setY(text.y - tween.getValue());
        text.setAlpha(text.alpha - tween.getValue() * 0.005);
      },
      onComplete: () => {
        this.remove(text, true);
      },
    });
  }

  protected pushPoint(x: number, y: number) {
    const boardRenderer = this.entity.getGame().getBoardRenderer();

    const worldPosition = boardRenderer.getGridToWorld(x, y);
    if (worldPosition === null) return;

    this.line.pushPoint(worldPosition.x, worldPosition.y);

    this.drawCount(
      worldPosition.x,
      worldPosition.y - boardRenderer.getTileSize().y / 2
    );
  }

  protected popPoint() {
    this.line.popPoint();
  }

  protected clearPoints() {
    this.line.clearPoints();
  }
}
