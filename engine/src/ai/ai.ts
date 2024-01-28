import Phaser from "phaser";

import type { AIController } from "../controllers/ai";
import { Entity } from "../entities/entity";

/**
 * An abstraction to implement artifical intelligence.
 *
 * This is used directly by the {@link AIController} to play the next line.
 */
export abstract class AI<TValueKey extends string = string> {
  /**
   * Calculate the next line for the passed entity.
   *
   * @param entity to calculate the line for.
   * @returns list of points that defines the line.
   */
  public abstract nextLine(
    entity: Entity<TValueKey>
  ): Phaser.Types.Math.Vector2Like[];
}
