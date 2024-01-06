import Phaser from "phaser";

import { Entity } from "../entities";

export abstract class AI {
  public abstract nextLine(entity: Entity): Phaser.Types.Math.Vector2Like[];
}
