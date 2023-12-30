import Phaser from "phaser";
import { Tile } from "../game/tile";
import { Board } from "../game/board";
import { Drag } from "../game/drag";
import { Human } from "../entities/human";
import { AI } from "../entities/ai";
import { Player } from "../entities/player";

export class GameScene extends Phaser.Scene {
    public static readonly BOARD_SIZE = 5;

    private board: Board = null as any;

    private playerIndex: number = 0;
    private players: Player[] = [];

    public preload() {
        this.load.image("board", "./assets/boards/5x5.png");

        this.load.audio("collect", "./assets/sounds/collect.mp3");
        this.load.audio("select", "./assets/sounds/select.mp3");

        Tile.KEYS.forEach(tile => {
            this.load.image(tile, `./assets/tiles/${tile}.png`);
        });
    }

    private dragStart(drag: Drag, x: number, y: number) {
        drag.start();

        if (this.dragUpdate(drag, x, y, false)) drag.updateStart();

        drag.updateEnd(x, y);
    }

    private dragStop(drag: Drag, x: number, y: number) {
        this.dragUpdate(drag, x, y, false, false);

        const points = drag.getPoints();
        if (points.length >= Board.MIN_LINE_LENGTH) {
            this.board.match(points);
            this.board.matchAnimate(points);

            this.players[this.playerIndex].turnEnd();

            setTimeout(() => {
                this.playerIndex = (this.playerIndex + 1) % this.players.length;
                this.players[this.playerIndex].turnStart();
            }, points.length * 200);
        }

        drag.stop();
    }

    private dragMove(drag: Drag, x: number, y: number) {
        if (this.dragUpdate(drag, x, y)) drag.updateStart();

        drag.updateEnd(x, y);
    }

    private drawCount(x: number, y: number, count: number, fill: number = 0) {
        const tileSize = this.board.getTileSize();

        let colorHex = fill.toString(16);
        colorHex = new Array(6 - colorHex.length).fill("0").join("") + colorHex;

        const text = this.add.text(x - tileSize.x / 4, y - tileSize.y / 2, `x${count}`, {
            color: `#${colorHex}`,
            font: "bold 25px Arial"
        });

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
                text.destroy(true);
            }
        });
    }

    private dragUpdate(drag: Drag, x: number, y: number, limitTileRange: boolean = true, animate: boolean = true) {
        const actualPoint = new Phaser.Math.Vector2(x, y);

        const gridPoint = this.board.alignPoint(x, y);
        if (gridPoint === null) return false;

        const tileSize = this.board.getTileSize();

        const lastPoint = drag.lastPoint;
        if (lastPoint) {
            if (Math.abs(lastPoint.x - gridPoint.x) > tileSize.x) return false;
            if (Math.abs(lastPoint.y - gridPoint.y) > tileSize.y) return false;
        }

        if (limitTileRange) {
            if (Math.abs(actualPoint.x - gridPoint.x) > tileSize.x / 3) return false;
            if (Math.abs(actualPoint.y - gridPoint.y) > tileSize.y / 3) return false; 
        }

        const tileId = this.board.getTileId(gridPoint.x, gridPoint.y);
        if (tileId === null) return false;

        const previousCount = drag.getPoints().length;

        if (!drag.update(gridPoint.x, gridPoint.y, tileId)) return false;

        const currentCount = drag.getPoints().length;

        if (animate) {
            const point = drag.lastPoint;
            if (point) {
                const tile = this.board.getTile(point.x, point.y);
                tile?.selectAnimate(currentCount);
            }

            if (currentCount > previousCount && currentCount >= Board.MIN_LINE_LENGTH) {
                this.drawCount(
                    gridPoint.x, 
                    gridPoint.y, 
                    currentCount, 
                    drag.fill
                );
            }
        }

        return true;
    }

    private attachPlayer(player: Player, drag: Drag) {
        player.onDragStart = (x, y) => this.dragStart(drag, x, y);
        player.onDragMove = (x, y) => this.dragMove(drag, x, y);
        player.onDragStop = (x, y) => this.dragStop(drag, x, y);
    }

    private createHuman(): Human {
        const drag = new Drag(this, 15 * this.board.scale, Math.floor(Math.random() * 0xFFFFFF));
        this.add.existing(drag);

        const human = new Human(this);
        this.attachPlayer(human, drag);

        return human;
    }

    private createAI(): AI {
        const drag = new Drag(this, 15 * this.board.scale, Math.floor(Math.random() * 0xFFFFFF));
        this.add.existing(drag);

        const ai = new AI(this, this.board);
        this.attachPlayer(ai, drag);

        return ai;
    }

    public create() {
        const scale = window.innerWidth > 1280 ? 1 : 0.5;

        this.board = new Board(this, window.innerWidth / 2 - 320 * scale, window.innerHeight / 2 - 320 * scale, GameScene.BOARD_SIZE);
        this.board.setScale(scale);
        this.add.existing(this.board);

        this.players.push(
            this.createHuman(),
            this.createAI()
        );

        this.players[0].turnStart();
    }
}
