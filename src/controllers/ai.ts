import Phaser from "phaser";
import { EntityController } from "./entity";
import { Tile } from "../board/tiles";
import { MAX_HEALTH, MIN_LINE_LENGTH } from "../config/game";
import { TileKey } from "../config/tile";

export class AIController extends EntityController {
    private positions: Phaser.Math.Vector2[] = [];

    private calculateWeights(): { [key in TileKey]: number } {
        let weights: { [key in TileKey]: number } = {
            sword: 1,
            potion: 1,
            shield: 1,
            heart: 0,
            gold: 5
        };

        if (this.entity.health < MAX_HEALTH / 2) weights.heart = 4;
        
        if (this.entity.strength < 10) weights.potion = 2;
        else if (this.entity.strength > 20) weights.sword = 2;

        if (this.entity.defense < 10) weights.shield = 3;
        else if (this.entity.defense > 20) weights.shield = 0;

        return weights;
    } 

    public override tick(delay: number = 0): void {
        const gridSize = this.board.getGridSize();

        if (this.positions.length === 0) {
            for (let x = 0; x < gridSize.x; x++) {
                for (let y = 0; y < gridSize.y; y++) {
                    this.positions.push(new Phaser.Math.Vector2(x, y));
                }
            }
        }

        const weights = this.calculateWeights();

        const positions = this.positions
            .map(p => [p, this.board.getTile(p.x, p.y)] as const)
            .sort(([_, ta], [__, tb]) => (weights[(tb?.getKey() ?? "") as TileKey] ?? 0) - (weights[(ta?.getKey() ?? "") as TileKey] ?? 0))
            .map(([p, _]) => p);

        let path: Tile[] = [];
        for (let point of positions) {
            const tile = this.board.getTile(point.x, point.y);
            if (tile === null) continue;

            path = [tile];
            if (this.searchPath(path)) break;
        }

        let previousIndex = -1;
        this.scene.tweens.addCounter({
            from: 0,
            to: path.length,
            duration: 250 * (path.length - 1),
            delay,
            onUpdate: (tween) => {
                const i = Math.floor(tween.getValue());
                if (i === previousIndex) return;
                if (i >= path.length) return;
                previousIndex = i;

                const point = path[i].getGridPoint();
                this.select(point.x, point.y);
            },
            onComplete: () => {
                this.match();
            }
        });
    }

    private searchPath(path: Tile[]): boolean {
        const tile = path[path.length - 1];

        if (tile === undefined) return false;
        for (let i = 0; i < path.length - 2; i++) {
            if (tile === path[i]) return false;
        }
        if (path.length > 1 && !tile.canMatch(path[path.length - 2])) return false;

        const directions = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) continue;

                directions.push(new Phaser.Math.Vector2(i, j));
            }
        }
        directions.sort((_a, _b) => Math.random() - 0.5);

        const gridPoint = tile.getGridPoint();
        for (let d of directions) {
            const nextTile = this.board.getTile(
                gridPoint.x + d.x,
                gridPoint.y + d.y
            );
            if (nextTile === null) continue

            path.push(nextTile);

            if (this.searchPath(path)) return true;

            path.pop();
        }

        return path.length >= MIN_LINE_LENGTH;
    }
}
