import Phaser from "phaser";
import { Entity } from "./entity";

/**
 * Debug renderer for {@link Entity.config}.
 */
export class EntityValueRenderer extends Phaser.GameObjects.Container {
  private entity: Entity;
  private text: Phaser.GameObjects.Text;

  public constructor(
    scene: Phaser.Scene,
    entity: Entity,
    x: number,
    y: number,
    fill: number,
    fontSize: number
  ) {
    super(scene, x, y);

    this.entity = entity;

    const config = this.entity.getConfig();

    const values = Object.entries(config).map(
      ([key, value]) => `${key}: ${value}`
    );

    let colorHex = fill.toString(16);
    colorHex = new Array(6 - colorHex.length).fill("0").join("") + colorHex;

    this.text = new Phaser.GameObjects.Text(
      this.scene,
      0,
      0,
      values.join("    "),
      {
        color: `#${colorHex}`,
        font: `bold ${fontSize}px Arial`,
        align: "center",
      }
    );
    this.add(this.text);

    Object.keys(config).forEach((key, i) => {
      this.entity.onValueChange(
        key as any,
        (value) => {
          values[i] = `${key}: ${value}`;

          this.text.text = values.join("    ");
        },
        this
      );
    });
  }
}
