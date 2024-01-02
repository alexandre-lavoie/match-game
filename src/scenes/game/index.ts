import Phaser from "phaser";

import { PointerController } from "../../engine/controllers/pointer";
import { FightGame } from "../../game";
import { BoardSound } from "../../engine/board/sound";
import { AIController } from "../../engine/controllers/ai";
import { FightAI } from "../../game/ai";
import { BoardRenderer } from "../../engine/board/renderer";
import { EntityLineRenderer } from "../../engine/entities/lineRenderer";
import { EntityValueRenderer } from "../../engine/entities/valueRenderer";

export abstract class GameScene extends Phaser.Scene {
    public static readonly PLAYER_COLOR = 0xFF0000;
    public static readonly ENEMY_COLOR = 0x0000FF;

    protected readonly matchGame: FightGame;

    public constructor() {
        super({
            key: "game"
        });

        this.matchGame = new FightGame();
    }

    protected abstract preloadDevice(): void;

    protected abstract getStroke(): number;
    protected abstract getFontSize(): number;

    protected abstract getBoardPlacement(): Phaser.Math.Vector2;
    protected abstract getEnemyPlacement(): Phaser.Math.Vector2;

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
        this.createControllers();
        this.createVisual();
        this.createSound();

        this.matchGame.start();
    }

    protected createControllers() {
        const playerController = new PointerController(this, this.matchGame.getPlayer());
        this.matchGame.addController(playerController);
        this.add.existing(playerController);

        const enemyController = new AIController(this, this.matchGame.getEnemy(), new FightAI());
        this.matchGame.addController(enemyController);
        this.add.existing(enemyController);
    }

    protected createVisual() {
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, "background");

        const enemyPlacement = this.getEnemyPlacement();
        const enemySprite = this.add.sprite(window.innerWidth * enemyPlacement.x, window.innerHeight * enemyPlacement.y, "enemy");

        const boardRenderer = new BoardRenderer(this, this.matchGame.getBoard(), 0, 0);

        const boardSprite = boardRenderer.getBoardSprite();

        const boardPlacement = this.getBoardPlacement();
        boardRenderer.x = window.innerWidth * boardPlacement.x - boardSprite.width / 2;
        boardRenderer.y = window.innerHeight * boardPlacement.y - boardSprite.height / 2;

        this.matchGame.addBoardRenderer(boardRenderer);
        this.add.existing(boardRenderer);

        const playerLine = new EntityLineRenderer(this, this.matchGame.getPlayer(), this.getStroke(), GameScene.PLAYER_COLOR, this.getFontSize());
        this.add.existing(playerLine);

        const playerValues = new EntityValueRenderer(
            this, 
            this.matchGame.getPlayer(), 
            boardRenderer.x,
            boardRenderer.y + boardSprite.height + this.getFontSize(),
            0xFFFFFF,
            this.getFontSize()
        );
        this.add.existing(playerValues);

        const enemyLine = new EntityLineRenderer(this, this.matchGame.getEnemy(), this.getStroke(), GameScene.ENEMY_COLOR, this.getFontSize());
        this.add.existing(enemyLine);

        const enemyValues = new EntityValueRenderer(
            this, 
            this.matchGame.getEnemy(), 
            enemySprite.x - enemySprite.width / 2,
            enemySprite.y + enemySprite.height / 2 + this.getFontSize(),
            0xFFFFFF,
            this.getFontSize()
        );
        this.add.existing(enemyValues);
    }

    protected createSound() {
        const boardSound = new BoardSound(this, this.matchGame.getBoardRenderer());
        this.add.existing(boardSound);
    }
}
