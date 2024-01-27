import Phaser from "phaser";

import type { Game } from "../game";

import { Entity } from "../entities";
import { EmitterContext } from "../types";

/**
 * An abstraction to control an {@link Entity}.
 *
 * This can be derived to support any type of input device (keyboard, mouse, etc).
 *
 * NOTE: Logic can be created to use "fake input device" (like for an AI).
 */
export abstract class Controller extends Phaser.GameObjects.GameObject {
  /**
   * Event emitter for {@link Controller}.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  /**
   * {@link Entity} attached to this {@link Controller}.
   */
  protected entity: Entity;

  public constructor(scene: Phaser.Scene, entity: Entity) {
    super(scene, "controller");

    this.entity = entity;
  }

  /**
   * Get {@link entity}.
   */
  public getEntity(): Entity {
    return this.entity;
  }

  /**
   * Call this logic every turn of a {@link Game}.
   *
   * DO OVERRIDE this method to perform logic every turn (like get input device state or update AI logic).
   */
  public tick(): void {}

  /**
   * Select a tile with {@link x}, {@link y} grid indices.
   *
   * @param x grid index.
   * @param y grid index.
   */
  protected select(x: number, y: number): void {
    this.eventEmitter.emit("select", x, y);
  }

  /**
   * Event listener for {@link select}.
   *
   * @param callback Function to call on {@link select}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onSelect(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("select", callback, context);
  }

  /**
   * Try to match the current line in {@link Entity}.
   */
  protected match(): void {
    this.eventEmitter.emit("match");
  }

  /**
   * Event listener for {@link match}.
   *
   * @param callback Function to call on {@link match}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onMatch(callback: () => void, context?: EmitterContext): this {
    return this.callbackWrap("match", callback, context);
  }

  private callbackWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.on(key, callback, context);

    return this;
  }
}
