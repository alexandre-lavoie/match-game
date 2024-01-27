import Phaser from "phaser";

import { Game } from "../game";
import { EmitterContext } from "../types";

import type { EntityLineRenderer } from "./lineRenderer";
import type { EntityValueRenderer } from "./valueRenderer";

/**
 * A collection of game values and a match line.
 *
 * @see {@link EntityLineRenderer} for {@link line} renderer.
 * @see {@link EntityValueRenderer} for {@link config} debug renderer.
 */
export class Entity {
  /**
   * Event emitter for {@link Entity}.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected game: Game;

  /**
   * Map of values.
   */
  protected config: Record<string, number>;

  /**
   * Line used for match.
   */
  protected line: Phaser.Geom.Polygon;

  public constructor(game: Game, config: Record<string, number>) {
    this.game = game;
    this.config = config;
    this.line = new Phaser.Geom.Polygon();
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  /**
   * Get {@link game}.
   */
  public getGame(): Game {
    return this.game;
  }

  /**
   * Get value of a key in {@link config}.
   */
  public getValue(key: string): number {
    return this.config[key];
  }

  /**
   * Get {@link config}.
   */
  public getConfig(): Record<string, number> {
    return this.config;
  }

  /**
   * Set value of a key in {@link config}.
   */
  public setValue(key: string, value: number): void {
    this.config[key] = value;
    this.eventEmitter.emit("valueChange", key, value);
  }

  /**
   * Event listener for {@link setValue}.
   *
   * @param key Key in {@link config} to listen changes for.
   * @param callback Function to call on {@link setValue}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onValueChange(
    key: string,
    callback: (value: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap(
      "valueChange",
      (otherKey: string, value: number) => key === otherKey && callback(value),
      context
    );
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
    return this.callbackWrap("pushPoint", callback, context);
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
    return this.callbackWrap("popPoint", callback, context);
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
    return this.callbackWrap("clearPoints", callback, context);
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

  private callbackWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.on(key, callback, context);

    return this;
  }
}
