import type { Board } from "../board/board";
import type { Tile } from "../board/tile";
import { Entity } from "../entities/entity";
import { Game } from "./game";

/**
 * An abstraction of a rule to define how to combine {@link Tile}s on a {@link Board} using a line and what effects are added if this rule is achieved.
 */
export abstract class Match<TValueKey extends string = string> {
  private game: Game<TValueKey>;

  public constructor(game: Game<TValueKey>) {
    this.game = game;
  }

  /**
   * Get {@link game}.
   */
  public getGame(): Game<TValueKey> {
    return this.game;
  }

  /**
   * Check if {@link x}, {@link y} coordinate can be added to {@link line}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @param line
   * @returns If {@link x}, {@link y} coordinate can be added.
   */
  public abstract canAdd(
    x: number,
    y: number,
    line: Phaser.Types.Math.Vector2Like[]
  ): boolean;

  /**
   * Check if {@link line} follows this {@link Match} rules.
   *
   * @param line
   */
  public abstract canMatch(line: Phaser.Types.Math.Vector2Like[]): boolean;

  /**
   * Apply the effect of this {@link Match}.
   *
   * @param entity to perform effects on.
   */
  public abstract match(entity: Entity): void;
}
