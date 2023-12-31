import Phaser from "phaser";

import { Board } from "../board";
import { PointerController } from "../controllers/pointer";
import { AIController } from "../controllers/ai";
import { EntityControllerCallbacks } from "../controllers/entity";
import { Entity } from "../entities/entity";
import { EntityRenderer } from "../entities/renderer";
import { TileRenderer } from "../board/tiles/renderer";
import { ProbabilityMap } from "../math";
import { RESPONSIVE_CONFIGS, ResponsiveConfig, RESPONSIVE_MIN_SIZE, ResponsiveSize } from "../config/responsive";
import { GRID_SIZE, LINE_DEPTH as ENTITY_DEPTH, MIN_LINE_LENGTH, UI_DEPTH, MAX_HEALTH } from "../config/game";
import { TILE_CONFIGS, TileKey } from "../config/tile";
import { EntityUI } from "../entities/ui";

export class GameScene extends Phaser.Scene {
    private board: Board = null as any;
    private responsiveConfig: ResponsiveConfig = null as any;

    private entities: Entity[] = [];
    private entityIndex: number = 0;

    public preload() {
        const displaySize = Math.min(window.innerWidth, window.innerHeight);

        let keySize: ResponsiveSize = "small";
        for (let i = 0; i < RESPONSIVE_MIN_SIZE.length; i++) {
            const [key, size] = RESPONSIVE_MIN_SIZE[i];
            if (size > displaySize) break;

            keySize = key;
        }

        this.responsiveConfig = RESPONSIVE_CONFIGS[keySize];        

        this.load.image("board", `./assets/art/boards/${keySize}.png`);
        this.load.spritesheet("tiles", `./assets/art/tiles/${keySize}.png`, { 
            frameWidth: this.responsiveConfig.tileSize, 
            frameHeight: this.responsiveConfig.tileSize 
        });

        this.load.image("background", "./assets/art/backgrounds/background.jpg");
        this.load.image("monster", "./assets/art/monsters/monster.png");

        this.load.audio("collect", "./assets/sounds/collect.mp3");
        this.load.audio("select", "./assets/sounds/select.mp3");

        // this.load.audio("music", "./assets/music/music.mp3");
    }

    private drawCount(x: number, y: number, count: number, fill: number = 0) {
        const tileSize = this.board.getTileSize();

        let colorHex = fill.toString(16);
        colorHex = new Array(6 - colorHex.length).fill("0").join("") + colorHex;

        const text = this.add.text(x, y - tileSize.y / 2, count.toString(), {
            color: `#${colorHex}`,
            font: `bold ${this.responsiveConfig.textSize}px Arial`
        });
        text.setDepth(UI_DEPTH);

        this.tweens.addCounter({
            from: 0,
            to: 10,
            duration: 500,
            onUpdate: (tween) => {
                text.setFontSize(30 + tween.getValue() * 2);
                text.setY(text.y - tween.getValue());
                text.setAlpha(text.alpha - tween.getValue() * 0.005);
            },
            onComplete: () => {
                text.destroy(false);
            }
        });
    }

    private select(entity: Entity, x: number, y: number): boolean {
        const tile = this.board.getTile(x, y);
        if (tile === null) return false;

        const line = entity.getLine();

        const popPoint = line[line.length - 2];
        if (popPoint && popPoint.x === x && popPoint.y === y) {
            entity.popPoint();

            tile.select(line.length - 1);

            return true;
        }

        if (entity.containsPoint(x, y)) return false;

        const previousPoint = line[line.length - 1];
        if (previousPoint) {
            if (previousPoint.x === x && previousPoint.y === y) return false;

            const previousTile = this.board.getTile(previousPoint.x, previousPoint.y);
            if (previousTile === null) return false;

            if (!tile.isAdjacent(previousTile)) return false;
            if (!tile.canMatch(previousTile)) return false;
        }

        entity.pushPoint(x, y);

        const tilePosition = tile.getWorldPosition();
        this.drawCount(tilePosition.x, tilePosition.y, line.length, entity.getFill());

        tile.select(line.length - 1);

        return true;
    }

    private match(entity: Entity): boolean {
        const line = entity.getLine();

        let valid = false;
        if (line.length >= MIN_LINE_LENGTH) {
            valid = true;

            let tiles = this.board.match(line);
            let delay = line.length * TileRenderer.MATCH_DELAY + TileRenderer.MATCH_DURATION;

            const entity = this.entities[this.entityIndex];
            tiles.find(tile => tile !== null)?.performAction(tiles.length, entity, this.entities.filter((other) => other !== entity));
            
            this.board.drop(delay);
            delay += TileRenderer.DROP_TILE_DURATION;

            this.board.fill(delay);
            delay += TileRenderer.SPAWN_DURATION;

            this.entityIndex = (this.entityIndex + 1) % this.entities.length;
            this.entities[this.entityIndex].tick(delay);
        }

        entity.clearPoints();
        
        return valid;
    }

    private makeCallbacks(entity: Entity): EntityControllerCallbacks {
        return {
            select: (x, y) => {
                if (this.entities[this.entityIndex] !== entity) return false;
                return this.select(entity, x, y);
            },
            match: () => {
                if (this.entities[this.entityIndex] !== entity) return false;
                return this.match(entity);
            }
        };
    }

    private createBoard() {
        const probabilityMap = new ProbabilityMap<TileKey>();
        Object.entries(TILE_CONFIGS).forEach(([key, config]) => probabilityMap.set(key as any, config.probability));

        const boardSize = this.responsiveConfig.boardSize;

        this.board = new Board(
            this, 
            window.innerWidth * this.responsiveConfig.gridOffset.x - boardSize / 2, 
            window.innerHeight * this.responsiveConfig.gridOffset.y - boardSize / 2, 
            {
                probabilityMap,
                gridSize: new Phaser.Math.Vector2(GRID_SIZE, GRID_SIZE)
            }
        );
        this.add.existing(this.board);
    }

    private createEntity(fill: number): Entity {
        const entity = new Entity(this, {
            health: MAX_HEALTH,
            defense: 0,
            strength: 0,
            board: this.board,
            stroke: this.responsiveConfig.stroke,
            fill
        });
        entity.addRenderer(new EntityRenderer(entity));
        this.add.existing(entity);

        return entity;
    }

    private createEntities() {
        const player = this.createEntity(0x880088);
        player.addController(new PointerController(player, this.makeCallbacks(player)));

        const playerUI = new EntityUI(
            player,
            window.innerWidth * this.responsiveConfig.gridOffset.x - this.responsiveConfig.boardSize / 2,
            window.innerHeight * this.responsiveConfig.gridOffset.y + this.responsiveConfig.boardSize / 2 + this.responsiveConfig.tileSize / 2
        );
        this.add.existing(playerUI);

        const ai = this.createEntity(0xFF0000);
        ai.addController(new AIController(ai, this.makeCallbacks(ai)));

        const aiUI = new EntityUI(
            ai, 
            window.innerWidth * this.responsiveConfig.monsterOffset.x - this.responsiveConfig.boardSize / 2,
            window.innerHeight * this.responsiveConfig.monsterOffset.y + this.responsiveConfig.boardSize / 2 + this.responsiveConfig.tileSize / 2
        );
        this.add.existing(aiUI);

        this.entities.push(player, ai);
        this.entities.forEach(entity => entity.setDepth(ENTITY_DEPTH));
    }

    public create() {
        const background = this.add.image(window.innerWidth / 2, window.innerHeight / 2, "background");
        background.scale = 0.8;

        const monster = this.add.image(window.innerWidth * this.responsiveConfig.monsterOffset.x, window.innerHeight * this.responsiveConfig.monsterOffset.y, "monster");
        monster.scale = this.responsiveConfig.name === "small" ? 0.5 : 1;
        monster.flipX = true;

        // this.sound.play("music", {
        //     volume: 0.05,
        //     loop: true
        // });

        this.createBoard();
        this.createEntities();

        this.entities[0]?.tick(0);
    }
}
