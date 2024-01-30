import Phaser from "phaser";

import { Game } from "../game/game";
import { EmitterContext } from "../types";
import type { EntityLineRenderer } from "./lineRenderer";
import type { EntityValueRenderer } from "./valueRenderer";

/**
 * A collection of game values and a match line.
 *
 * @see {@link EntityLineRenderer} for {@link line} renderer.
 * @see {@link EntityValueRenderer} for {@link values} debug renderer.
 */
export class Entity<TValueKey extends string = string> {
  /**
   * Event emitter for {@link Entity}.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected readonly game: Game<TValueKey>;

  /**
   * Map of values.
   */
  protected values: Record<TValueKey, number>;

  /**
   * Line used for match.
   */
  protected line: Phaser.Geom.Polygon;

  public constructor(game: Game<TValueKey>, values: Record<TValueKey, number>) {
    this.game = game;
    this.values = values;
    this.line = new Phaser.Geom.Polygon();
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Get {@link game}.
   */
  public getGame(): Game<TValueKey> {
    return this.game;
  }

  /**
   * Get value of a key in {@link values}.
   */
  public getValue(key: TValueKey): number {
    return this.values[key];
  }

  /**
   * Get {@link values}.
   */
  public getValues(): Record<TValueKey, number> {
    return this.values;
  }

  /**
   * Set value of a key in {@link values}.
   */
  public setValue(key: TValueKey, value: number): void {
    this.values[key] = value;
    this.eventEmitter.emit(`valueChange-${key}`, value);
  }

  /**
   * Event listener for {@link setValue}.
   *
   * @param key Key in {@link values} to listen changes for.
   * @param callback Function to call on {@link setValue}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onValueChange(
    key: TValueKey,
    callback: (value: number) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap(`valueChange-${key}`, callback, context);
  }

  public offValueChange(
    key: TValueKey,
    callback: (value: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap(`valueChange-${key}`, callback, context);
  }

  /**
   * Adds a new {@link x}, {@link y} coordinate at end of {@link line}.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  public pushPoint(x: number, y: number): void {
    this.line.points.push(new Phaser.Geom.Point(x, y));
    this.eventEmitter.emit("pushPoint", x, y);
  }

  /**
   * Event listener for {@link pushPoint}.
   *
   * @param callback Function to call on {@link pushPoint}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onPushPoint(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("pushPoint", callback, context);
  }

  /**
   * Remove {@link onPushPoint}.
   */
  public offPushPoint(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("pushPoint", callback, context);
  }

  /**
   * Removes last point of {@link line}.
   *
   * @param x coordinate.
   * @param y coordinate.
   */
  public popPoint(): void {
    if (this.line.points.pop()) this.eventEmitter.emit("popPoint", this);
  }

  /**
   * Event listener for {@link popPoint}.
   *
   * @param callback Function to call on {@link popPoint}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onPopPoint(callback: () => void, context: EmitterContext): this {
    return this.onWrap("popPoint", callback, context);
  }

  /**
   * Remove {@link onPopPoint}.
   */
  public offPopPoint(callback: () => void, context: EmitterContext): this {
    return this.offWrap("popPoint", callback, context);
  }

  /**
   * Removes all points from {@link line}.
   */
  public clearPoints(): void {
    this.line.points.splice(0, this.line.points.length);
    this.eventEmitter.emit("clearPoints");
  }

  /**
   * Event listener for {@link clearPoints}.
   *
   * @param callback Function to call on {@link clearPoints}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onClearPoints(callback: () => void, context?: EmitterContext): this {
    return this.onWrap("clearPoints", callback, context);
  }

  /**
   * Remove {@link onClearPoints}.
   */
  public offClearPoints(callback: () => void, context?: EmitterContext): this {
    return this.offWrap("clearPoints", callback, context);
  }

  /**
   * Check if {@link x}, {@link y} coordinate is in {@link line}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns Is contained.
   */
  public containsPoint(x: number, y: number): boolean {
    return this.line.points.some((p) => p.x === x && p.y === y);
  }

  /**
   * Get {@link Phaser.Geom.Polygon.points}.
   */
  public getLine(): Phaser.Geom.Point[] {
    return this.line.points;
  }

  private onWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.on(key, callback, context);

    return this;
  }

  private offWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.off(key, callback, context);

    return this;
  }
}
