import {
  BoardRenderer,
  BoardSound,
  EntityLineRenderer,
  EntityValueRenderer,
} from "match-game";
import Phaser from "phaser";

import { RESIZE_RANGES } from "../config";
import { FightGame } from "../game";

export abstract class GameScene extends Phaser.Scene {
  public static readonly PLAYER_COLOR = 0xff0000;
  public static readonly ENEMY_COLOR = 0x0000ff;

  protected matchGame!: FightGame;

  private backgroundImage!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private boardRenderer!: BoardRenderer;
  private playerValues!: EntityValueRenderer;
  private enemyValues!: EntityValueRenderer;

  public constructor(view: string) {
    super({
      key: view,
    });
  }

  public init({ game }: { game: FightGame }) {
    this.matchGame = game;
  }

  protected abstract preloadDevice(): void;

  protected abstract getStroke(): number;
  protected abstract getFontSize(): number;

  protected abstract getBoardPlacement(): Phaser.Math.Vector2;

  protected abstract getEnemyFlip(): boolean;
  protected abstract getEnemyPlacement(): Phaser.Math.Vector2 | null;

  public preload() {
    this.preloadDevice();
    this.preloadArt();
    this.preloadSound();
  }

  protected preloadArt() {
    this.load.image("background", "./assets/art/backgrounds/background.jpg");
  }

  protected preloadSound() {
    this.load.audio("collect", "./assets/sounds/collect.mp3");
    this.load.audio("select", "./assets/sounds/select.mp3");
  }

  public create() {
    this.createVisual(this.scale.width, this.scale.height);
    this.createSound();

    this.scale.on("resize", this.resize, this);

    this.matchGame.start();
  }

  protected createVisual(width: number, height: number) {
    this.backgroundImage = this.add.image(width / 2, height / 2, "background");

    const enemyPlacement = this.getEnemyPlacement();
    this.enemySprite = this.add.sprite(
      width * (enemyPlacement?.x ?? -1),
      height * (enemyPlacement?.y ?? -1),
      `${this.scene.key}-enemy`
    );
    if (this.getEnemyFlip()) this.enemySprite.setFlipX(true);

    this.boardRenderer = new BoardRenderer(
      this,
      this.matchGame.getBoard(),
      0,
      0,
      `${this.scene.key}-board`,
      `${this.scene.key}-tiles`
    );

    const boardSprite = this.boardRenderer.getBoardSprite();
    const boardPlacement = this.getBoardPlacement();
    this.boardRenderer.setPosition(
      width * boardPlacement.x - boardSprite.width / 2,
      height * boardPlacement.y - boardSprite.height / 2
    );

    this.matchGame.addBoardRenderer(this.boardRenderer);
    this.add.existing(this.boardRenderer);

    const playerLine = new EntityLineRenderer(
      this,
      this.matchGame.getPlayer(),
      this.getStroke(),
      GameScene.PLAYER_COLOR,
      this.getFontSize()
    );
    this.add.existing(playerLine);

    this.playerValues = new EntityValueRenderer(
      this,
      this.matchGame.getPlayer(),
      this.boardRenderer.x,
      this.boardRenderer.y + boardSprite.height + this.getFontSize(),
      0xffffff,
      this.getFontSize()
    );
    this.add.existing(this.playerValues);

    const enemyLine = new EntityLineRenderer(
      this,
      this.matchGame.getEnemy(),
      this.getStroke(),
      GameScene.ENEMY_COLOR,
      this.getFontSize()
    );
    this.add.existing(enemyLine);

    let position = [
      this.enemySprite.x - this.enemySprite.width / 2,
      this.enemySprite.y + this.enemySprite.height / 2 + this.getFontSize(),
    ] as const;
    if (!enemyPlacement) {
      position = [
        this.boardRenderer.x,
        this.boardRenderer.y - this.getFontSize() * 2,
      ];
    }

    this.enemyValues = new EntityValueRenderer(
      this,
      this.matchGame.getEnemy(),
      ...position,
      0xffffff,
      this.getFontSize()
    );
    this.add.existing(this.enemyValues);
  }

  protected createSound() {
    const boardSound = new BoardSound(this, this.matchGame.getBoardRenderer());
    this.add.existing(boardSound);
  }

  protected resize(
    _gameSize: any,
    { width, height }: { width: number; height: number }
  ) {
    let newScene = false;
    for (let [key, [minWidth, minHeight]] of RESIZE_RANGES) {
      if (this.scale.width >= minWidth && this.scale.height >= minHeight) {
        if (this.scene.key !== key) {
          this.scale.off("resize", this.resize, this);

          this.scene.start(key, { game: this.matchGame });

          newScene = true;
        }

        break;
      }
    }

    if (newScene) return;

    this.backgroundImage.setPosition(width / 2, height / 2);

    const enemyPlacement = this.getEnemyPlacement();
    this.enemySprite.setPosition(
      width * (enemyPlacement?.x ?? -1),
      height * (enemyPlacement?.y ?? -1)
    );

    const boardSprite = this.boardRenderer.getBoardSprite();
    const boardPlacement = this.getBoardPlacement();
    this.boardRenderer.setPosition(
      width * boardPlacement.x - boardSprite.width / 2,
      height * boardPlacement.y - boardSprite.height / 2
    );

    this.playerValues.setPosition(
      this.boardRenderer.x,
      this.boardRenderer.y + boardSprite.height + this.getFontSize()
    );

    if (enemyPlacement) {
      this.enemyValues.setPosition(
        this.enemySprite.x - this.enemySprite.width / 2,
        this.enemySprite.y + this.enemySprite.height / 2 + this.getFontSize()
      );
    } else {
      this.enemyValues.setPosition(
        this.boardRenderer.x,
        this.boardRenderer.y - this.getFontSize() * 2
      );
    }
  }
}
