import { Board } from "../board/board";
import { BoardRenderer } from "../board/renderer";
import { Controller } from "../controllers/controller";
import { Entity } from "../entities/entity";
import { ProbabilityMap } from "../math/probabilityMap";
import { EmitterContext } from "../types";
import { Match } from "./match";

/**
 * An abstract of main data/logic for your game.
 *
 * DO OVERRIDE this class to implement your game.
 */
export abstract class Game<TValueKey extends string = string> {
  /**
   * Event emitter for {@link Entity}.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onStart}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  /**
   * Game board.
   */
  protected board!: Board<TValueKey>;

  /**
   * Renderer for {@link board}.
   */
  protected boardRenderer!: BoardRenderer<TValueKey>;

  /**
   * List of all {@link Entity}.
   */
  protected entities: Entity<TValueKey>[] = [];

  /**
   * Index in {@link entities} of current playing {@link Entity}.
   */
  protected entityIndex = -1;

  /**
   * Map of {@link Entity} associated to {@link Controller}.
   */
  protected controllers: Map<Entity<TValueKey>, Controller> = new Map();

  /**
   * List of {@link Match} rules that this game has to follow.
   */
  protected matches: Match<TValueKey>[] = [];

  /**
   * Probabilities of each tile to appear.
   */
  private tileProbability!: ProbabilityMap<number>;

  /**
   * Enable/disable {@link Controller}s.
   */
  private interactive: boolean = true;

  /**
   * Game is running.
   */
  private playing: boolean = false;

  public addBoard(board: Board<TValueKey>): this {
    this.board = board;

    return this;
  }

  public addProbability(map: ProbabilityMap<number>) {
    this.tileProbability = map;
  }

  public addBoardRenderer(renderer: BoardRenderer<TValueKey>): this {
    this.boardRenderer = renderer;

    return this;
  }

  public addEntity(entity: Entity<TValueKey>): this {
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

  public addMatch(match: Match<TValueKey>): this {
    this.matches.push(match);

    return this;
  }

  /**
   * Enable/disable {@link Controller}s.
   */
  public setInteractive(value: boolean = true): void {
    this.interactive = value;
  }

  /**
   * Get {@link board}.
   */
  public getBoard(): Board<TValueKey> {
    return this.board;
  }

  /**
   * Get {@link boardRenderer}.
   */
  public getBoardRenderer(): BoardRenderer<TValueKey> {
    return this.boardRenderer;
  }

  /**
   * Get {@link Entity} at {@link index} of {@link entities}.
   *
   * @param index
   * @returns entity. Null if out of bounds.
   */
  public getEntity(index: number): Entity<TValueKey> | null {
    return this.entities[index] ?? null;
  }

  /**
   * Get {@link entities}.
   */
  public getEntities(): Entity<TValueKey>[] {
    return this.entities;
  }

  /**
   * Given an {@link Entity}, get a list of all other {@link Entity} in this game.
   *
   * @param entity to compare.
   * @returns List of all other {@link Entity}.
   */
  public getOtherEntities(entity: Entity<TValueKey>): Entity<TValueKey>[] {
    return this.entities.filter((other) => other !== entity);
  }

  /**
   * Get next tile ID to generate.
   *
   * DO OVERRIDE to implement your own tile creation logic.
   *
   * @returns Next tile to generate.
   */
  public getNextTileKey(): number {
    return this.tileProbability.random();
  }

  /**
   * Check if {@link x}, {@link y} coordinate can be added to line according to {@link Match} rules defined in this game.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @param line to add to.
   * @returns If the {@link x}, {@link y} coordinate be added to the {@link line}.
   */
  public hasMatch(
    x: number,
    y: number,
    line: Phaser.Types.Math.Vector2Like[]
  ): boolean {
    return this.matches.some((match) => match.canAdd(x, y, line));
  }

  /**
   * Get {@link Match} that applies to {@link line}.
   *
   * @param line x, y coordinates of line.
   * @returns the {@link Match} that applies for the {@link line}. Null if no {@link Match} applies to {@link line}.
   */
  public getMatch(
    line: Phaser.Types.Math.Vector2Like[]
  ): Match<TValueKey> | null {
    return this.matches.find((match) => match.canMatch(line)) ?? null;
  }

  /**
   * Change to next playing {@link Entity}.
   */
  private nextEntity(): void {
    this.entityIndex = (this.entityIndex + 1) % this.entities.length;
    this.controllers.get(this.entities[this.entityIndex])?.tick();
  }

  /**
   * Start {@link Game}.
   *
   * MUST BE called to start playing.
   */
  public start(): void {
    this.playing = true;

    this.entityIndex = -1;
    this.nextEntity();

    this.eventEmitter.emit("start");
  }

  /**
   * Event listener for {@link start}.
   *
   * @param callback Function to call on {@link start}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onStart(callback: () => void, context?: EmitterContext): this {
    return this.onWrap("start", callback, context);
  }

  /**
   * Remove {@link onStart}.
   */
  public offStart(callback: () => void, context?: EmitterContext): this {
    return this.offWrap("start", callback, context);
  }

  /**
   * End {@link Game}.
   */
  public end(): void {
    this.playing = false;

    this.boardRenderer = null as any;
    this.controllers = new Map();

    this.eventEmitter.emit("end");
  }

  /**
   * Event listener for {@link end}.
   *
   * @param callback Function to call on {@link end}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onEnd(callback: () => void, context?: EmitterContext): this {
    return this.onWrap("end", callback, context);
  }

  /**
   * Remove {@link onEnd}.
   */
  public offEnd(callback: () => void, context?: EmitterContext): this {
    return this.offWrap("end", callback, context);
  }

  /**
   * Add selected {@link x}, {@link y} coordinate to {@link Entity.line}.
   *
   * @param entity to modify.
   * @param x coordinate.
   * @param y coordinate.
   */
  protected pushSelect(entity: Entity<TValueKey>, x: number, y: number): void {
    const board = this.getBoard();

    entity.pushPoint(x, y);
    board.select(x, y, entity.getLine().length);
  }

  /**
   * Remove selected {@link x}, {@link y} coordinate from {@link Entity.line}.
   *
   * @param entity to modify.
   * @param x coordinate.
   * @param y coordinate.
   */
  protected popSelect(entity: Entity<TValueKey>, x: number, y: number): void {
    const board = this.getBoard();

    entity.popPoint();
    board.select(x, y, entity.getLine().length);
  }

  /**
   * Handle {@link Controller.select} towards an {@link Entity}.
   *
   * @param entity with {@link Entity.line} to select.
   * @param x coordinate.
   * @param y coordinate.
   * @returns if the tile was selected.
   */
  private controllerSelect(
    entity: Entity<TValueKey>,
    x: number,
    y: number
  ): boolean {
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

  /**
   * Handle when an {@link Entity} has a successful {@link Match}.
   *
   * {@link controllerMatch} handles performing {@link Match.match} and changing entities.
   * Only implement state changing logic (like adding/remove tiles or checking if the {@link _entity} won).
   *
   * @param _entity with a match.
   */
  protected abstract match(_entity: Entity<TValueKey>): void;

  /**
   * Handle {@link Controller.match} towards an {@link Entity}.
   *
   * @param entity with {@link Entity.line} to match.
   * @param x coordinate.
   * @param y coordinate.
   * @returns if {@link Entity.line} was matched.
   */
  private controllerMatch(entity: Entity<TValueKey>): boolean {
    if (!this.interactive) return false;
    if (this.entities[this.entityIndex] !== entity) return false;

    let match = this.getMatch(entity.getLine());
    if (match) {
      match.match(entity);

      this.match(entity);

      if (this.playing) {
        this.nextEntity();

        this.eventEmitter.emit(
          "entity-change",
          this.entities[this.entityIndex]
        );
      }
    }

    entity.clearPoints();

    return true;
  }

  /**
   * Event listener for when a new {@link Entity} is play.
   *
   * For all intents and purposes, consider this as "onNextTurn".
   *
   * @param callback Function to call on new {@link Entity} is play.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onEntityChange(
    callback: (entity: Entity<TValueKey>) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("entity-change", callback, context);
  }

  /**
   * Remove {@link onEntityChange}.
   */
  public offEntityChange(
    callback: (entity: Entity<TValueKey>) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("entity-change", callback, context);
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
