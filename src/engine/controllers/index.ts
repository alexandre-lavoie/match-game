import Phaser from "phaser";

import { Entity } from "../entities";
import { EmitterContext } from "../types";

export abstract class Controller extends Phaser.GameObjects.GameObject {
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected entity: Entity;

  public constructor(scene: Phaser.Scene, entity: Entity) {
    super(scene, "controller");

    this.entity = entity;
  }

  public getEntity(): Entity {
    return this.entity;
  }

  public tick(): void {}

  protected select(x: number, y: number) {
    this.eventEmitter.emit("select", x, y);
  }

  public onSelect(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("select", callback, context);
  }

  protected match(): void {
    this.eventEmitter.emit("match");
  }

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
