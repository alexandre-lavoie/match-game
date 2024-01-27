import Phaser from "phaser";
import { Game } from "../game";
import { Tile } from "./tile";
import { EmitterContext } from "../types";

import type { BoardRenderer } from "./renderer";
import type { BoardSound } from "./sound";

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
export class Board {
  /**
   * Event emitter for the board.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  private game: Game;
  private tiles: BoardTile[][];

  public constructor(game: Game, size: number) {
    this.game = game;
    this.tiles = this.makeGrid(size);
  }

  /**
   * Get {@link Game}.
   */
  public getGame(): Game {
    return this.game;
  }

  /**
   * Create a new tile at {@link x}, {@link y}. Determines next tile based of the current game state.
   */
  private makeTile(x: number, y: number): Tile {
    return new Tile(this.game.getNextTileKey(), x, y);
  }

  /**
   * Create a new grid of {@link size}.
   *
   * @param size x, y size of grid.
   * @returns grid of tiles.
   */
  private makeGrid(size: number): BoardTile[][] {
    const grid = new Array(size).fill(0).map((_) => new Array(size).fill(0));

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
   * Get the width and height of the boar .
   *
   * @returns Vector2 where {@link Phaser.Math.Vector2.x} = width and {@link Phaser.Math.Vector2.y} = height.
   */
  public getSize(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.tiles.length, this.tiles.length);
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
    return this.callbackWrap("select", callback, context);
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
    return this.callbackWrap("match", callback, context);
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
      for (let y = my + 1; y < this.tiles.length; y++) {
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
    return this.callbackWrap("pull", callback, context);
  }

  /**
   * Clear a line vertically at column {@link x}.
   *
   * @param x coordinate.
   */
  public clearLineX(x: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[x][i] === null) continue;

      this.tiles[x][i] = null;
      points.push([x, i]);
    }

    this.eventEmitter.emit("clearLine", points);
  }

  /**
   * Clear a line horizontally at row {@link y}.
   *
   * @param y coordinate.
   */
  public clearLineY(y: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i][y] === null) continue;

      this.tiles[i][y] = null;
      points.push([i, y]);
    }

    this.eventEmitter.emit("clearLine", points);
  }

  /**
   * Event listener for {@link clearLineX} and {@link clearLineY}.
   *
   * @param callback Function to call on {@link clearLineX} or {@link clearLineY}.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onClearLine(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("clearLine", callback, context);
  }

  /**
   * Fill empty slots in grid with new tiles.
   */
  public fill(): void {
    const newTiles: [number, number][] = [];
    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles.length; y++) {
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
    context: EmitterContext
  ): this {
    return this.callbackWrap("fill", callback, context);
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
