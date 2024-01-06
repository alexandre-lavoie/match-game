import Phaser from "phaser";
import { Game } from "../game";
import { Tile } from "./tile";
import { EmitterContext } from "../types";

export type BoardTile = Tile | null;

export class Board {
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  private game: Game;
  private tiles: BoardTile[][];

  public constructor(game: Game, size: number) {
    this.game = game;
    this.tiles = this.makeGrid(size);
  }

  public getGame(): Game {
    return this.game;
  }

  private makeTile(x: number, y: number): Tile {
    return new Tile(this.game.getNextTileKey(), x, y);
  }

  private makeGrid(size: number): BoardTile[][] {
    const grid = new Array(size).fill(0).map((_) => new Array(size).fill(0));

    return grid.map((col, x) => col.map((_, y) => this.makeTile(x, y)));
  }

  public getTile(x: number, y: number): BoardTile {
    return this.tiles[x]?.[y] ?? null;
  }

  public getTiles(): BoardTile[][] {
    return this.tiles;
  }

  public getSize(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.tiles.length, this.tiles.length);
  }

  public select(x: number, y: number, offset: number = 0): void {
    this.eventEmitter.emit("select", x, y, offset);
  }

  public onSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("select", callback, context);
  }

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

  public onMatch(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("match", callback, context);
  }

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

  public onPull(
    callback: (moves: [number, number, number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("pull", callback, context);
  }

  public clearLineX(x: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[x][i] === null) continue;

      this.tiles[x][i] = null;
      points.push([x, i]);
    }

    this.eventEmitter.emit("clearLine", points);
  }

  public clearLineY(y: number): void {
    const points: [number, number][] = [];

    for (let i = 0; i < this.tiles.length; i++) {
      if (this.tiles[i][y] === null) continue;

      this.tiles[i][y] = null;
      points.push([i, y]);
    }

    this.eventEmitter.emit("clearLine", points);
  }

  public onClearLine(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("clearLine", callback, context);
  }

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
