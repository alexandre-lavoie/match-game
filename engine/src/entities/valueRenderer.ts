import Phaser from "phaser";

import { Entity } from "./entity";

/**
 * Debug renderer for {@link Entity.values}.
 */
export class EntityValueRenderer<
  TValueKey extends string = string,
> extends Phaser.GameObjects.Container {
  private entity: Entity<TValueKey>;
  private text: Phaser.GameObjects.Text;

  public constructor(
    scene: Phaser.Scene,
    entity: Entity<TValueKey>,
    x: number,
    y: number,
    fill: number,
    fontSize: number
  ) {
    super(scene, x, y);

    this.entity = entity;

    const values = this.entity.getValues();

    const valueTexts = Object.entries(values).map(
      ([key, value]) => `${key}: ${value}`
    );

    let colorHex = fill.toString(16);
    colorHex = new Array(6 - colorHex.length).fill("0").join("") + colorHex;

    this.text = new Phaser.GameObjects.Text(
      this.scene,
      0,
      0,
      valueTexts.join("    "),
      {
        color: `#${colorHex}`,
        font: `bold ${fontSize}px Arial`,
        align: "center",
      }
    );
    this.add(this.text);

    Object.keys(values).forEach((key, i) => {
      this.entity.onValueChange(
        key as any,
        (value) => {
          valueTexts[i] = `${key}: ${value}`;

          this.text.text = valueTexts.join("    ");
        },
        this
      );
    });
  }
}
