import {
  AIController,
  BoardRenderer,
  BoardSound,
  EntityLineRenderer,
  PointerController,
} from "match-game";
import Phaser from "phaser";

import { SampleAI } from "../game/ai";
import { FONT_SIZE, STROKE_WIDTH } from "../game/config";
import { SampleGame } from "../game/game";

export class GameScene extends Phaser.Scene {
  private matchGame!: SampleGame;
  private boardRenderer!: BoardRenderer;

  private scoreText!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;

  public constructor() {
    super({
      key: "game",
    });
  }

  public init({ game }: { game: SampleGame }) {
    this.matchGame = game;
  }

  public preload() {
    this.load.image("board", "./assets/art/board.png");
    this.load.spritesheet("tiles", "./assets/art/tiles.png", {
      frameWidth: 88,
      frameHeight: 88,
    });

    this.load.audio("collect", "./assets/sounds/collect.mp3");
    this.load.audio("select", "./assets/sounds/select.mp3");
  }

  public create() {
    this.createBoard();
    this.createEntities();

    this.createControllers();

    this.scale.on(
      "resize",
      (_gameSize: any, baseSize: { width: number; height: number }) =>
        this.resize(baseSize.width, baseSize.height)
    );
    this.resize(this.scale.width, this.scale.height);

    this.matchGame.onEnd(() => {
      this.scene.start("end", { game: this.matchGame });
      this.matchGame.getBoard().reset();
    });

    this.matchGame.start();
  }

  /**
   * Create objects related to {@link Board} rendering/sound.
   */
  private createBoard() {
    const board = this.matchGame.getBoard();

    this.boardRenderer = new BoardRenderer(this, board, 0, 0);
    this.add.existing(this.boardRenderer);
    this.matchGame.addBoardRenderer(this.boardRenderer);

    const boardSound = new BoardSound(this, this.boardRenderer);
    this.add.existing(boardSound);
  }

  /**
   * Create objects related to {@link Entity} rendering.
   */
  private createEntities() {
    this.createLines();
    this.createScoreText();
    this.createWinText();
  }

  /**
   * Create {@link EntityLineRenderer} for {@link SampleGame.entities}.
   */
  private createLines() {
    const entities = this.matchGame.getEntities();

    entities.forEach((entity) => {
      const lineRenderer = new EntityLineRenderer(
        this,
        entity,
        STROKE_WIDTH,
        0xff0000,
        FONT_SIZE
      );
      this.add.existing(lineRenderer);
    });
  }

  /**
   * Create score text.
   */
  private createScoreText() {
    const entities = this.matchGame.getEntities();

    const scoreTexts: string[] = entities.map(
      (entity) => `${entity.getValue("score")}`
    );

    this.scoreText = this.add.text(0, 0, "Scores: " + scoreTexts.join(", "), {
      font: `bold ${FONT_SIZE}px Arial`,
    });

    entities.forEach((entity, i) => {
      entity.onValueChange("score", (value) => {
        scoreTexts[i] = `${value}`;

        this.scoreText.text = "Scores: " + scoreTexts.join(", ");
      });
    });
  }

  private createWinText() {
    const entities = this.matchGame.getEntities();

    const winTexts: string[] = entities.map(
      (entity) => `${entity.getValue("win")}`
    );

    this.winText = this.add.text(0, 0, "Wins: " + winTexts.join(", "), {
      font: `bold ${FONT_SIZE}px Arial`,
    });

    entities.forEach((entity, i) => {
      entity.onValueChange("win", (value) => {
        winTexts[i] = `${value}`;

        this.winText.text = "Wins: " + winTexts.join(", ");
      });
    });
  }

  /**
   * Create controllers for entities.
   *
   * First player is human mouse/touch screen controllable, others are all AI.
   *
   * CHANGE THIS to fit your game logic (example: all players, all AI, etc).
   */
  private createControllers() {
    const entities = [...this.matchGame.getEntities()];

    // Remove first entity and add controller.
    const player = entities.shift()!;
    const playerController = new PointerController(this, player);
    this.add.existing(playerController);
    this.matchGame.addController(playerController);

    // Add AI controller for others.
    entities.forEach((entity) => {
      const ai = new SampleAI();
      const aiController = new AIController(this, entity, ai);
      this.add.existing(aiController);
      this.matchGame.addController(aiController);
    });
  }

  /**
   * Handle screen resize.
   *
   * @param width new width of scene.
   * @param height new height of scene.
   */
  private resize(width: number, height: number) {
    this.resizeBoard(width, height);
    this.resizeScoreText(width, height);
    this.resizeWinText(width, height);
  }

  /**
   * Resize {@link boardRenderer}.
   */
  private resizeBoard(width: number, height: number) {
    const boardSprite = this.boardRenderer.getBoardSprite();

    this.boardRenderer.x = width / 2 - boardSprite.width / 2;
    this.boardRenderer.y = height / 2 - boardSprite.height / 2;
  }

  /**
   * Resize {@link scoreText}.
   */
  private resizeScoreText(width: number, height: number) {
    const boardSprite = this.boardRenderer.getBoardSprite();
    const tileSize = this.boardRenderer.getTileSize();

    this.scoreText.x = width / 2 - tileSize.x / 2;
    this.scoreText.y = height / 2 - boardSprite.height / 2 - tileSize.y / 2;
  }

  /**
   * Resize {@link winText}.
   */
  private resizeWinText(width: number, height: number) {
    const boardSprite = this.boardRenderer.getBoardSprite();
    const tileSize = this.boardRenderer.getTileSize();

    this.winText.x = width / 2 - tileSize.x / 2;
    this.winText.y = height / 2 - boardSprite.height / 2 - tileSize.y / 4;
  }
}
