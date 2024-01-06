import Phaser from "phaser";

import { Game } from "../game";
import { EmitterContext } from "../types";

export class Entity {
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected game: Game;

  protected config: Record<string, number>;
  protected line: Phaser.Geom.Polygon;

  public constructor(game: Game, config: Record<string, number>) {
    this.game = game;
    this.config = config;
    this.line = new Phaser.Geom.Polygon();
    this.eventEmitter = new Phaser.Events.EventEmitter();
  }

  public getGame(): Game {
    return this.game;
  }

  public getValue(key: string): number {
    return this.config[key];
  }

  public getConfig(): Record<string, number> {
    return this.config;
  }

  public setValue(key: string, value: number) {
    this.config[key] = value;
    this.eventEmitter.emit("valueChange", key, value);
  }

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

  public pushPoint(x: number, y: number) {
    this.line.points.push(new Phaser.Geom.Point(x, y));
    this.eventEmitter.emit("pushPoint", x, y);
  }

  public onPushPoint(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("pushPoint", callback, context);
  }

  public popPoint() {
    if (this.line.points.pop()) this.eventEmitter.emit("popPoint", this);
  }

  public onPopPoint(callback: () => void, context: EmitterContext): this {
    return this.callbackWrap("popPoint", callback, context);
  }

  public clearPoints() {
    this.line.points.splice(0, this.line.points.length);
    this.eventEmitter.emit("clearPoints");
  }

  public onClearPoints(callback: () => void, context?: EmitterContext): this {
    return this.callbackWrap("clearPoints", callback, context);
  }

  public containsPoint(x: number, y: number): boolean {
    return this.line.points.some((p) => p.x === x && p.y === y);
  }

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
