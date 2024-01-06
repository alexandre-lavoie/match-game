import Phaser from "phaser";

import { Board, BoardTile } from ".";
import { EmitterContext } from "../types";

export type BoardTileSprite = Phaser.GameObjects.Sprite | null;

export class BoardRenderer extends Phaser.GameObjects.Container {
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected board: Board;

  protected boardSprite: Phaser.GameObjects.Sprite;
  protected tileSprites: BoardTileSprite[][];

  private readonly tileSize: Phaser.Math.Vector2;

  private animationDelay: number = 0;

  public constructor(scene: Phaser.Scene, board: Board, x: number, y: number) {
    super(scene, x, y);

    this.board = board;
    this.attachCallbacks();

    this.boardSprite = this.makeBoardSprite();
    const gridSize = this.board.getSize();
    this.tileSize = new Phaser.Math.Vector2(
      this.boardSprite.width / gridSize.x,
      this.boardSprite.height / gridSize.y
    );

    this.tileSprites = this.makeTileSprites();
  }

  private attachCallbacks() {
    this.board
      .onMatch(this.match, this)
      .onSelect(this.select, this)
      .onClearLine(this.clearLine, this)
      .onPull(this.pull, this)
      .onFill(this.fill, this);
  }

  public getAnimationDelay(): number {
    return this.animationDelay;
  }

  public getBoardSprite(): Phaser.GameObjects.Sprite {
    return this.boardSprite;
  }

  public getTileSprite(x: number, y: number): BoardTileSprite {
    return this.tileSprites[x]?.[y] ?? null;
  }

  public getTileSize(): Phaser.Math.Vector2 {
    return this.tileSize;
  }

  public getTileWorld(x: number, y: number): BoardTile {
    const gridPoint = this.getWorldToGrid(x, y);
    if (gridPoint === null) return null;

    return this.board.getTile(gridPoint.x, gridPoint.y);
  }

  public getGridToWorld(x: number, y: number): Phaser.Math.Vector2 | null {
    const gridSize = this.board.getSize();
    if (x < 0 || x >= gridSize.x) return null;
    if (y < 0 || y >= gridSize.y) return null;

    const tileSize = this.getTileSize();
    return new Phaser.Math.Vector2(
      this.x + x * tileSize.x + tileSize.x / 2,
      this.y + y * tileSize.y + tileSize.y / 2
    );
  }

  public getWorldToGrid(x: number, y: number): Phaser.Math.Vector2 | null {
    const tileSize = this.getTileSize();
    const gridSize = this.board.getSize();

    const boardPoint = new Phaser.Math.Vector2(x - this.x, y - this.y);
    if (boardPoint.x < 0 || boardPoint.x > gridSize.x * tileSize.x) return null;
    if (boardPoint.y < 0 || boardPoint.y > gridSize.y * tileSize.y) return null;

    return new Phaser.Math.Vector2(
      Math.floor(boardPoint.x / tileSize.x),
      Math.floor(boardPoint.y / tileSize.y)
    );
  }

  public alignToGrid(x: number, y: number): Phaser.Math.Vector2 | null {
    const gridPoint = this.getWorldToGrid(x, y);
    if (gridPoint === null) return null;

    return this.getGridToWorld(gridPoint.x, gridPoint.y);
  }

  protected select(x: number, y: number, offset: number) {
    if (this.animationDelay > 0) return;

    const tileSprite = this.getTileSprite(x, y);
    if (tileSprite === null) return;

    this.scene.tweens.add({
      targets: tileSprite,
      duration: 200,
      scale: 1.25,
      yoyo: true,
      onComplete: () => {
        this.scale = 1;
      },
    });

    this.eventEmitter.emit("select", x, y, offset);
  }

  public onSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("select", callback, context);
  }

  public onCollect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.callbackWrap("collect", callback, context);
  }

  protected match(points: [number, number][]) {
    if (points.length === 0) return;

    const animationDuration = points.length * 100 + 200;

    const delay = this.animationDelay;
    this.animationDelay += animationDuration;

    points.forEach(([x, y], i) => {
      const tileSprite = this.getTileSprite(x, y);
      if (tileSprite === null) return;

      this.tileSprites[x][y] = null;

      this.scene.tweens.add({
        targets: tileSprite,
        duration: 200,
        scale: 0,
        delay: delay + i * 100,
        onStart: () => {
          this.eventEmitter.emit("collect", x, y, i);
        },
        onComplete: () => {
          if (i === points.length - 1) this.animationDelay -= animationDuration;
          tileSprite.destroy(false);
        },
      });
    });
  }

  protected clearLine(points: [number, number][]) {
    if (points.length === 0) return;

    const animationDuration = 200;

    const delay = this.animationDelay;
    this.animationDelay += animationDuration;

    points.forEach(([x, y], i) => {
      const tileSprite = this.getTileSprite(x, y);
      if (tileSprite === null) return;

      this.tileSprites[x][y] = null;

      this.scene.tweens.add({
        targets: tileSprite,
        duration: 200,
        scale: 0,
        delay: delay,
        onComplete: () => {
          if (i === points.length - 1) this.animationDelay -= animationDuration;
          tileSprite.destroy(false);
        },
      });
    });
  }

  protected pull(moves: [number, number, number, number][]) {
    if (moves.length === 0) return;

    const animationDuration = 250;

    const delay = this.animationDelay;
    this.animationDelay += animationDuration;

    moves.forEach(([x, y, nx, ny], i) => {
      const tileSprite = this.getTileSprite(x, y);
      if (tileSprite === null) return;

      this.tileSprites[x][y] = null;
      this.tileSprites[nx][ny] = tileSprite;

      const tileSize = this.getTileSize();

      this.scene.tweens.add({
        targets: tileSprite,
        duration: animationDuration,
        x: nx * tileSize.x + tileSize.x / 2,
        delay,
      });

      this.scene.tweens.add({
        targets: tileSprite,
        duration: animationDuration,
        y: ny * tileSize.y + tileSize.y / 2,
        delay,
        onComplete: () => {
          if (i === moves.length - 1) this.animationDelay -= animationDuration;
        },
      });
    });
  }

  protected fill(points: [number, number][]) {
    if (points.length === 0) return;

    const animationDuration = 250;

    const delay = this.animationDelay;
    this.animationDelay += animationDuration;

    points.forEach(([x, y], i) => {
      const tileSprite = this.makeTileSprite(this.board.getTile(x, y));
      this.tileSprites[x][y] = tileSprite;
      if (tileSprite === null) return;

      tileSprite.scale = 0;
      this.scene.tweens.add({
        targets: tileSprite,
        duration: animationDuration,
        scale: 1,
        delay,
        onComplete: () => {
          if (i === points.length - 1) this.animationDelay -= animationDuration;
          tileSprite.scale = 1;
        },
      });
    });
  }

  protected makeBoardSprite(): Phaser.GameObjects.Sprite {
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "board");
    sprite.setOrigin(0);
    this.add(sprite);

    return sprite;
  }

  protected makeTileSprite(tile: BoardTile): BoardTileSprite {
    if (tile === null) return null;

    const tileSize = this.getTileSize();
    const sprite = new Phaser.GameObjects.Sprite(
      this.scene,
      tile.x * tileSize.x + tileSize.x / 2,
      tile.y * tileSize.y + tileSize.y / 2,
      "tiles",
      tile.key
    );
    this.add(sprite);

    return sprite;
  }

  protected makeTileSprites(): BoardTileSprite[][] {
    return this.board
      .getTiles()
      .map((col, _x) => col.map((tile, _y) => this.makeTileSprite(tile)));
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
