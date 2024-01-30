import Phaser from "phaser";

import { Game } from "../game/game";
import { EmitterContext } from "../types";
import type { BoardRenderer } from "./renderer";
import type { BoardSound } from "./sound";
import { Tile } from "./tile";

/**
 * Tile placed on board.
 */
export type BoardTile = Tile | null;

/**
 * An NxN 2D grid of tiles.
 * It contains useful interactions with these tiles (matching them, adding them, removing them, etc).
 *
 * @see {@link BoardRenderer} for renderer
 * @see {@link BoardSound} for sound
 */
export class Board<TValueKey extends string = string> {
  /**
   * Event emitter for the board.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  private readonly game: Game<TValueKey>;
  private tiles: BoardTile[][];

  public readonly width: number;
  public readonly height: number;

  public constructor(game: Game<TValueKey>, width: number, height?: number) {
    this.game = game;

    this.width = width;
    this.height = height ?? width;

    this.tiles = this.makeGrid(this.width, this.height);
  }

  /**
   * Get {@link Game}.
   */
  public getGame(): Game<TValueKey> {
    return this.game;
  }

  /**
   * Create a new tile at {@link x}, {@link y}. Determines next tile based of the current game state.
   */
  private makeTile(x: number, y: number): Tile {
    return new Tile(this.game.getNextTileKey(x, y), x, y);
  }

  /**
   * Create a new grid of {@link size}.
   *
   * @param size x, y size of grid.
   * @returns grid of tiles.
   */
  private makeGrid(width: number, height: number): BoardTile[][] {
    const grid = new Array(width).fill(0).map((_) => new Array(height).fill(0));

    return grid.map((col, x) => col.map((_, y) => this.makeTile(x, y)));
  }

  /**
   * Get tile at {@link x}, {@link y}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns A tile object or null if not found.
   */
  public getTile(x: number, y: number): BoardTile {
    return this.tiles[x]?.[y] ?? null;
  }

  /**
   * Get {@link tiles}.
   */
  public getTiles(): BoardTile[][] {
    return this.tiles;
  }

  /**
   * Set tile at {@link x}, {@link y} with a key of {@link key}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @param key frame index. Null for empty tile.
   */
  public setTile(x: number, y: number, key: number | null): void {
    this.tiles[x][y] = key === null ? null : new Tile(key, x, y);

    this.eventEmitter.emit("set-tile", x, y);
  }

  /**
   * Event listener for {@link select}.
   *
   * @param callback Function to call on {@link select}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onSetTile(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("set-tile", callback, context);
  }

  /**
   * Once event listener for {@link select}.
   *
   * @param callback Function to call on {@link select}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceSetTile(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("set-tile", callback, context);
  }

  /**
   * Remove {@link onSelect}.
   */
  public offSetTile(
    callback: (x: number, y: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("set-tile", callback, context);
  }

  /**
   * Select tile at {@link x}, {@link y}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @param offset Should only be used to offset the pitch. Useful to give variety in the line selection.
   */
  public select(x: number, y: number, offset: number = 0): void {
    this.eventEmitter.emit("select", x, y, offset);
  }

  /**
   * Event listener for {@link select}.
   *
   * @param callback Function to call on {@link select}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("select", callback, context);
  }

  /**
   * Once event listener for {@link select}.
   *
   * @param callback Function to call on {@link select}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("select", callback, context);
  }

  /**
   * Remove {@link onSelect}.
   */
  public offSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("select", callback, context);
  }

  /**
   * Clear a line of points (aka match a line).
   *
   * @param points x, y coordinates of line to clear.
   */
  public match(points: Phaser.Types.Math.Vector2Like[]): void {
    points.map((point) => {
      const tile = this.getTile(point?.x ?? -1, point?.y ?? -1);
      if (!tile) return null;

      this.tiles[point.x ?? -1][point.y ?? -1] = null;
    });

    this.eventEmitter.emit(
      "match",
      points.map((p) => [p?.x ?? -1, p?.y ?? -1])
    );
  }

  /**
   * Event listener for {@link match}.
   *
   * @param callback Function to call on {@link match}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onMatch(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("match", callback, context);
  }

  /**
   * Once event listener for {@link match}.
   *
   * @param callback Function to call on {@link match}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceMatch(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("match", callback, context);
  }

  /**
   * Remove {@link onMatch}.
   */
  public offMatch(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("match", callback, context);
  }

  /**
   * Move all tiles up into empty grid slots.
   *
   * Example: If the first line is cleared, all the tiles would move up one, leaving the last line empty.
   */
  public pullUp(): void {
    const indices = this.tiles.map((col) =>
      col
        .map((tile, index) => [tile, index] as const)
        .reverse()
        .reduce((prev, [tile, i]) => (tile === null ? i : prev), -1)
    );

    const moves: [number, number, number, number][] = [];
    indices.forEach((my, x) => {
      if (my === -1) return;

      let i = my;
      for (let y = my + 1; y < this.height; y++) {
        const tile = this.getTile(x, y);
        if (tile === null) continue;

        const ny = i++;

        tile.y = ny;
        this.tiles[x][y] = null;
        this.tiles[x][ny] = tile;

        moves.push([x, y, x, ny]);
      }
    });

    this.eventEmitter.emit("pull", moves);
  }

  /**
   * Move all tiles down into empty grid slots.
   *
   * Example: If the last line is cleared, all the tiles would move down one, leaving the first line empty.
   */
  public pullDown(): void {
    const indices = this.tiles.map((col) =>
      col.reduce((prev, tile, i) => (tile === null ? i : prev), -1)
    );

    const moves: [number, number, number, number][] = [];
    indices.forEach((my, x) => {
      if (my === -1) return;

      let i = my;
      for (let y = my - 1; y >= 0; y--) {
        const tile = this.getTile(x, y);
        if (tile === null) continue;

        const ny = i--;

        tile.y = ny;
        this.tiles[x][y] = null;
        this.tiles[x][ny] = tile;

        moves.push([x, y, x, ny]);
      }
    });

    this.eventEmitter.emit("pull", moves);
  }

  /**
   * Event listener for {@link pullUp} and {@link pullDown}.
   *
   * @param callback Function to call on {@link pullUp} or {@link pullDown}. Provides an array of tuples where [previousX, previousY, nextX, nextY].
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onPull(
    callback: (moves: [number, number, number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("pull", callback, context);
  }

  /**
   * Once event listener for {@link pullUp} and {@link pullDown}.
   *
   * @param callback Function to call on {@link pullUp} or {@link pullDown}. Provides an array of tuples where [previousX, previousY, nextX, nextY].
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public oncePull(
    callback: (moves: [number, number, number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("pull", callback, context);
  }

  /**
   * Remove {@link onPull}.
   */
  public offPull(
    callback: (moves: [number, number, number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("pull", callback, context);
  }

  /**
   * Clear a line vertically at column {@link x}.
   *
   * @param x coordinate.
   */
  public clearLineX(x: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.height; i++) {
      if (this.tiles[x][i] === null) continue;

      this.tiles[x][i] = null;
      points.push([x, i]);
    }

    this.eventEmitter.emit("clear", points);
  }

  /**
   * Clear a line horizontally at row {@link y}.
   *
   * @param y coordinate.
   */
  public clearLineY(y: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.width; i++) {
      if (this.tiles[i][y] === null) continue;

      this.tiles[i][y] = null;
      points.push([i, y]);
    }

    this.eventEmitter.emit("clear", points);
  }

  /**
   * Event listener for {@link clearLineX} and {@link clearLineY}.
   *
   * @param callback Function to call on {@link clearLineX} or {@link clearLineY}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onClear(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("clear", callback, context);
  }

  /**
   * Once event listener for {@link clearLineX} and {@link clearLineY}.
   *
   * @param callback Function to call on {@link clearLineX} or {@link clearLineY}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceClear(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("clear", callback, context);
  }

  /**
   * Remove {@link onClear}.
   */
  public offClear(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("clear", callback, context);
  }

  /**
   * Fill empty slots in grid with new tiles.
   */
  public fill(): void {
    const newTiles: [number, number][] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.tiles[x][y] !== null) continue;

        this.tiles[x][y] = this.makeTile(x, y);
        newTiles.push([x, y]);
      }
    }

    this.eventEmitter.emit("fill", newTiles);
  }

  /**
   * Event listener for {@link fill}
   *
   * @param callback Function to call on {@link fill}. Provides an array of x, y coordinates with new tiles.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onFill(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("fill", callback, context);
  }

  /**
   * Once event listener for {@link fill}
   *
   * @param callback Function to call on {@link fill}. Provides an array of x, y coordinates with new tiles.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceFill(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("fill", callback, context);
  }

  /**
   * Remove {@link onFill}.
   */
  public offFill(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("fill", callback, context);
  }

  /**
   * Clear all tiles and replace with new tiles.
   */
  public reset(): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.tiles[x][y] = this.makeTile(x, y);
      }
    }

    this.eventEmitter.emit("reset");
  }

  /**
   * Event listener for {@link reset}
   *
   * @param callback Function to call on {@link reset}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onReset(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("reset", callback, context);
  }

  /**
   * Once event listener for {@link reset}
   *
   * @param callback Function to call on {@link reset}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onceReset(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.onceWrap("reset", callback, context);
  }

  /**
   * Remove {@link onReset}.
   */
  public offReset(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("reset", callback, context);
  }

  private onWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.on(key, callback, context);

    return this;
  }

  private onceWrap<T extends (...args: any[]) => void>(
    key: string,
    callback: T,
    context?: EmitterContext
  ): this {
    this.eventEmitter.once(key, callback, context);

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
