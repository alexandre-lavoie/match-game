import { Game } from ".";
import { Entity } from "../entities";

export abstract class Match {
    private game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public getGame(): Game {
        return this.game;
    }

    public abstract canAdd(x: number, y: number, line: Phaser.Types.Math.Vector2Like[]): boolean;
    public abstract canMatch(line: Phaser.Types.Math.Vector2Like[]): boolean;
    public abstract match(entity: Entity): void;
}
