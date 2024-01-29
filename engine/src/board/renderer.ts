import Phaser from "phaser";

import { EmitterContext } from "../types";
import { Board, BoardTile } from "./board";

export type BoardTileSprite = Phaser.GameObjects.Sprite | null;

/**
 * Renderer for {@link Board}
 */
export class BoardRenderer<TValueKey extends string = string> extends Phaser
  .GameObjects.Container {
  /**
   * Event emitter for {@link BoardRenderer}.
   *
   * DO NOT attach to these events directly. Use the helper methods like {@link onSelect}.
   */
  protected readonly eventEmitter: Phaser.Events.EventEmitter =
    new Phaser.Events.EventEmitter();

  protected readonly board: Board<TValueKey>;

  protected readonly boardSprite: Phaser.GameObjects.Sprite;
  protected tileSprites: BoardTileSprite[][];

  /**
   * The world width and height of a {@link BoardTile}.
   *
   * {@link Phaser.Math.Vector2.x} = width, {@link Phaser.Math.Vector2} = height
   */
  private readonly tileSize: Phaser.Math.Vector2;

  /**
   * A running sum of all the animation delays accumulated.
   *
   * This is used to synchronize animations and prevent animations to overlap (in case we perform multiple actions on the board at once).
   */
  private animationDelay: number = 0;

  public constructor(
    scene: Phaser.Scene,
    board: Board<TValueKey>,
    x: number,
    y: number
  ) {
    super(scene, x, y);

    this.board = board;
    this.attachCallbacks();

    this.boardSprite = this.makeBoardSprite();
    this.tileSize = new Phaser.Math.Vector2(
      this.boardSprite.width / this.board.width,
      this.boardSprite.height / this.board.height
    );

    this.tileSprites = this.makeTileSprites();
  }

  private attachCallbacks() {
    this.board
      .onSetTile(this.setTile, this)
      .onMatch(this.match, this)
      .onSelect(this.select, this)
      .onClear(this.clear, this)
      .onPull(this.pull, this)
      .onFill(this.fill, this)
      .onReset(this.reset, this);
  }

  private removeCallbacks() {
    this.board
      .offSetTile(this.setTile, this)
      .offMatch(this.match, this)
      .offSelect(this.select, this)
      .offClear(this.clear, this)
      .offPull(this.pull, this)
      .offFill(this.fill, this)
      .offReset(this.reset, this);
  }

  protected preDestroy(): void {
    this.removeCallbacks();

    super.preDestroy();
  }

  /**
   * Get {@link animationDelay}.
   */
  public getAnimationDelay(): number {
    return this.animationDelay;
  }

  /**
   * Get {@link boardSprite}.
   */
  public getBoardSprite(): Phaser.GameObjects.Sprite {
    return this.boardSprite;
  }

  /**
   * Get {@link BoardTileSprite} at {@link x}, {@link y} coordinate of {@link tileSprites}.
   *
   * @param x coordinate.
   * @param y coordinate.
   * @returns tile. Null if empty tile or not found.
   */
  public getTileSprite(x: number, y: number): BoardTileSprite {
    return this.tileSprites[x]?.[y] ?? null;
  }

  /**
   * Get {@link tileSize}.
   */
  public getTileSize(): Phaser.Math.Vector2 {
    return this.tileSize;
  }

  /**
   * Get tile on this board at a specific {@link x}, {@link y} world/scene coordinate.
   *
   * @param x world coordinate.
   * @param y world coordinate.
   * @returns Tile at x, y world coordinate. Null if there is no tile on this board at that coordinate.
   */
  public getTileWorld(x: number, y: number): BoardTile {
    const gridPoint = this.getWorldToGrid(x, y);
    if (gridPoint === null) return null;

    return this.board.getTile(gridPoint.x, gridPoint.y);
  }

  /**
   * Convert {@link x}, {@link y} grid indices into an x, y world coordinate.
   *
   * @param x grid index.
   * @param y grid index.
   * @returns x, y world coordinate. Null if X or Y indices are out of grid bounds.
   */
  public getGridToWorld(x: number, y: number): Phaser.Math.Vector2 | null {
    if (x < 0 || x >= this.board.width) return null;
    if (y < 0 || y >= this.board.height) return null;

    const tileSize = this.getTileSize();
    return new Phaser.Math.Vector2(
      this.x + x * tileSize.x + tileSize.x / 2,
      this.y + y * tileSize.y + tileSize.y / 2
    );
  }

  /**
   * Convert an {@link x}, {@link y} world coordinate into x, y grid indices.
   *
   * @param x world coordinate.
   * @param y world coordinate.
   * @returns x, y grid indices. Null if x, y world coordinate is not in the grid bounds.
   */
  public getWorldToGrid(x: number, y: number): Phaser.Math.Vector2 | null {
    const tileSize = this.getTileSize();

    const boardPoint = new Phaser.Math.Vector2(x - this.x, y - this.y);
    if (boardPoint.x < 0 || boardPoint.x > this.board.width * tileSize.x)
      return null;
    if (boardPoint.y < 0 || boardPoint.y > this.board.height * tileSize.y)
      return null;

    return new Phaser.Math.Vector2(
      Math.floor(boardPoint.x / tileSize.x),
      Math.floor(boardPoint.y / tileSize.y)
    );
  }

  /**
   * Align an {@link x}, {@link y} world coordinate to the center of the nearest tile x, y world coordinate.
   *
   * @param x world coordinate.
   * @param y world coordinate.
   * @returns x, y world coordinate of center of nearest tile. Null if x, y world coordinate is not near enough to a tile.
   */
  public alignToGrid(x: number, y: number): Phaser.Math.Vector2 | null {
    const gridPoint = this.getWorldToGrid(x, y);
    if (gridPoint === null) return null;

    return this.getGridToWorld(gridPoint.x, gridPoint.y);
  }

  /**
   * Renderer for {@link Board.setTile}.
   */
  protected setTile(x: number, y: number): void {
    const oldTileSprite = this.getTileSprite(x, y);

    const newTileSprite = this.makeTileSprite(this.board.getTile(x, y));
    if (newTileSprite) newTileSprite.scale = 0;

    this.tileSprites[x][y] = newTileSprite;

    const delay = this.animationDelay;
    this.animationDelay +=
      (oldTileSprite ? 200 : 0) + (newTileSprite ? 200 : 0);

    const newTile = (delay: number) => {
      if (!newTileSprite) return;

      this.scene.tweens.add({
        targets: newTileSprite,
        duration: 200,
        scale: 1,
        delay,
        onComplete: () => {
          newTileSprite.scale = 1;
          this.animationDelay -= 200;
        },
      });
    };

    if (oldTileSprite) {
      this.scene.tweens.add({
        targets: oldTileSprite,
        duration: 200,
        delay,
        scale: 0,
        onComplete: () => {
          newTile(0);
          oldTileSprite.destroy();
          this.animationDelay -= 200;
        },
      });
    } else {
      newTile(delay);
    }
  }

  /**
   * Renderer for {@link Board.select}.
   */
  protected select(x: number, y: number, offset: number): void {
    if (this.animationDelay > 0) return;

    const tileSprite = this.getTileSprite(x, y);
    if (tileSprite === null) return;

    this.scene.tweens.add({
      targets: tileSprite,
      duration: 200,
      scale: 1.25,
      yoyo: true,
      onComplete: () => {
        tileSprite.scale = 1;
      },
    });

    this.eventEmitter.emit("select", x, y, offset);
  }

  /**
   * Event listener for {@link select}.
   *
   * You probably want to use {@link Board.onSelect}, unless if you want to know when the animation is complete.
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
   * Remove {@link onSelect}.
   */
  public offSelect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("select", callback, context);
  }

  /**
   * Event listener for when a tile is collected.
   *
   * @param callback Function to call when a tile is collected. Provides x, y grid indices and line offset of collected tile.
   * @param context Context to run function in.
   * @returns This for chaining.
   */
  public onCollect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.onWrap("collect", callback, context);
  }

  /**
   * Remove {@link onCollect}.
   */
  public offCollect(
    callback: (x: number, y: number, offset: number) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("collect", callback, context);
  }

  /**
   * Renderer for {@link Board.match}.
   */
  protected match(points: [number, number][]): void {
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
          if (i === points.length - 1) {
            this.animationDelay -= animationDuration;
            this.eventEmitter.emit("match", points);
          }

          tileSprite.destroy(false);
        },
      });
    });
  }

  /**
   * Event listener for {@link match}.
   *
   * You probably want to use {@link Board.onMatch}, unless if you want to know when the animation is complete.
   *
   * @param callback Function to call when a tile is collected.
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
   * Remove {@link onMatch}.
   */
  public offMatch(
    callback: (points: [number, number][]) => void,
    context?: EmitterContext
  ): this {
    return this.offWrap("match", callback, context);
  }

  /**
   * Renderer for {@link Board.clearLineX} and {@link Board.clearLineY}.
   */
  protected clear(points: [number, number][]): void {
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

  /**
   * Renderer for {@link Board.pullUp} and {@link Board.pullDown}.
   */
  protected pull(moves: [number, number, number, number][]): void {
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

  /**
   * Renderer for {@link Board.fill}.
   */
  protected fill(points: [number, number][]): void {
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

  /**
   * Renderer for {@link reset}.
   */
  protected reset(): void {
    for (let x = 0; x < this.tileSprites.length; x++) {
      for (let y = 0; y < this.tileSprites[x].length; y++) {
        const tileSprite = this.tileSprites[x][y];

        this.tileSprites[x][y] = this.makeTileSprite(this.board.getTile(x, y));
        if (tileSprite) tileSprite.destroy();
      }
    }
  }

  /**
   * Create the background grid sprite for {@link Board}.
   */
  protected makeBoardSprite(): Phaser.GameObjects.Sprite {
    const sprite = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "board");
    sprite.setOrigin(0);
    this.add(sprite);

    return sprite;
  }

  /**
   * Create a sprite for the {@link BoardTile} in {@link Board}.
   */
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

  /**
   * Create all sprites for {@link BoardTile} in {@link Board}.
   */
  protected makeTileSprites(): BoardTileSprite[][] {
    return this.board
      .getTiles()
      .map((col, _x) => col.map((tile, _y) => this.makeTileSprite(tile)));
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
