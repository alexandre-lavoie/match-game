import Phaser from "phaser";
import { Player } from "./player";
import { Board } from "../game/board";

export class AI extends Player {
    private board: Board;
    private positions: Phaser.Math.Vector2[] = [];

    constructor(scene: Phaser.Scene, board: Board) {
        super(scene);

        this.board = board;
    }

    private searchPath(path: Phaser.Math.Vector2[], tileId: number, tileIds: number[][]): boolean {
        const point = path[path.length - 1];

        if (point === undefined) return false;
        for (let i = 0; i < path.length - 2; i++) {
            if (path[i].equals(point)) return false;
        }
        if (tileIds[point.x]?.[point.y] !== tileId) return false;

        const directions = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;

                directions.push(new Phaser.Math.Vector2(i, j));
            }
        }
        directions.sort((_a, _b) => Math.random() - 0.5);

        for (let d of directions) {
            path.push(new Phaser.Math.Vector2(point.x + d.x, point.y + d.y));

            if (this.searchPath(path, tileId, tileIds)) return true;

            path.pop();
        }

        return path.length >= Board.MIN_LINE_LENGTH;
    }

    private indicesToWorld(x: number, y: number): Phaser.Math.Vector2 {
        const tileSize = this.board.getTileSize();

        return new Phaser.Math.Vector2(this.board.x + x * tileSize.x + tileSize.y / 2, this.board.y + y * tileSize.y + tileSize.y / 2);
    }

    public turnStartInner(): void {
        const tileIds = this.board.getTileIds();

        if (this.positions.length === 0) {
            for (let i = 0; i < tileIds.length; i++) {
                for (let j = 0; j < tileIds[i].length; j++) {
                    this.positions.push(new Phaser.Math.Vector2(i, j));
                }
            }
        }
        this.positions.sort((_a, _b) => Math.random() - 0.5);

        let path: Phaser.Math.Vector2[] = [];
        for (let firstPoint of this.positions) {
            path = [firstPoint];

            const tileId = tileIds[firstPoint.x][firstPoint.y];

            if (this.searchPath(path, tileId, tileIds)) break;
        }

        this.scene.tweens.addCounter({
            from: 0,
            to: path.length - 1 - 0.0001,
            duration: 250 * (path.length - 1),
            onStart: () => {
                const startPoint = this.indicesToWorld(path[0].x, path[0].y);
                this.dragStart(startPoint.x, startPoint.y);
            },
            onUpdate: (tween) => {
                const i = Math.floor(tween.getValue());

                const prevPoint = path[i];
                const point = path[i + 1];

                const indices = Phaser.Math.LinearXY(prevPoint, point, tween.getValue() - i);
                const target = this.indicesToWorld(indices.x, indices.y);
                this.dragMove(target.x, target.y);
            },
            onComplete: () => {
                let point = path[path.length - 1];

                this.dragStop(point.x, point.y);
            }
        });
    }

    public turnEndInner(): void {}
}
