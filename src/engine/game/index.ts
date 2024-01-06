import { Board } from "../board";
import { BoardRenderer } from "../board/renderer";
import { Entity } from "../entities";
import { ProbabilityMap } from "../math";
import { Controller } from "../controllers";
import { Match } from "./match";
import { EmitterContext } from "../types";

export class Game {
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected board: Board = null as any;
  protected boardRenderer: BoardRenderer = null as any;

  protected entities: Entity[] = [];
  protected entityIndex = -1;

  protected controllers: Map<Entity, Controller> = new Map();

  protected matches: Match[] = [];

  private tileProbability: ProbabilityMap<number> = null as any;

  private interactive: boolean = true;

  public addBoard(board: Board): this {
    this.board = board;

    return this;
  }

  public addProbability(map: ProbabilityMap<number>) {
    this.tileProbability = map;
  }

  public addBoardRenderer(renderer: BoardRenderer): this {
    this.boardRenderer = renderer;

    return this;
  }

  public addEntity(entity: Entity): this {
    this.entities.push(entity);

    return this;
  }

  public addController(controller: Controller): this {
    this.controllers.set(controller.getEntity(), controller);

    const entity = controller.getEntity();

    controller.onSelect((x, y) => this.controllerSelect(entity, x, y), this);
    controller.onMatch(() => this.controllerMatch(entity), this);

    return this;
  }

  public addMatch(match: Match): this {
    this.matches.push(match);

    return this;
  }

  public setInteractive(value: boolean = true) {
    this.interactive = value;
  }

  public getBoard(): Board {
    return this.board;
  }

  public getBoardRenderer(): BoardRenderer {
    return this.boardRenderer;
  }

  public getEntity(index: number): Entity | null {
    return this.entities[index] ?? null;
  }

  public getEntities(): Entity[] {
    return this.entities;
  }

  public getOtherEntities(entity: Entity): Entity[] {
    return this.entities.filter((other) => other !== entity);
  }

  public getNextTileKey(): number {
    return this.tileProbability.random();
  }

  public hasMatch(
    x: number,
    y: number,
    line: Phaser.Types.Math.Vector2Like[]
  ): boolean {
    return this.matches.some((match) => match.canAdd(x, y, line));
  }

  public getMatch(line: Phaser.Types.Math.Vector2Like[]): Match | null {
    return this.matches.find((match) => match.canMatch(line)) ?? null;
  }

  private nextEntity() {
    this.entityIndex = (this.entityIndex + 1) % this.entities.length;
    this.controllers.get(this.entities[this.entityIndex])?.tick();
  }

  public start() {
    this.nextEntity();

    this.eventEmitter.emit("game-start");
  }

  public onStart(callback: () => void, context?: EmitterContext) {
    this.callbackWrap("game-start", callback, context);
  }

  protected pushSelect(entity: Entity, x: number, y: number): void {
    const board = this.getBoard();

    entity.pushPoint(x, y);
    board.select(x, y, entity.getLine().length);
  }

  protected popSelect(entity: Entity, x: number, y: number): void {
    const board = this.getBoard();

    entity.popPoint();
    board.select(x, y, entity.getLine().length);
  }

  private controllerSelect(entity: Entity, x: number, y: number): boolean {
    if (!this.interactive) return false;
    if (this.entities[this.entityIndex] !== entity) return false;

    const line = entity.getLine();

    const undoPoint = line[line.length - 2];
    if (undoPoint?.x === x && undoPoint?.y === y) {
      this.popSelect(entity, undoPoint.x, undoPoint.y);

      return true;
    }

    if (entity.containsPoint(x, y)) return false;

    if (!this.hasMatch(x, y, line)) return false;

    this.pushSelect(entity, x, y);

    return true;
  }

  protected match(_entity: Entity): void {}

  private controllerMatch(entity: Entity): boolean {
    if (!this.interactive) return false;
    if (this.entities[this.entityIndex] !== entity) return false;

    let match = this.getMatch(entity.getLine());
    if (match) {
      match.match(entity);

      this.match(entity);

      this.nextEntity();

      this.eventEmitter.emit(
        "game-entity-change",
        this.entities[this.entityIndex]
      );
    }

    entity.clearPoints();

    return true;
  }

  public onEntityChange(
    callback: (entity: Entity) => void,
    context?: EmitterContext
  ) {
    this.callbackWrap("game-entity-change", callback, context);
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
