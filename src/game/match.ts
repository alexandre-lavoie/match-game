import { MAX_HEALTH, MIN_LINE_LENGTH } from "./config";
import { TILE_KEYS, TileKey } from "./tile";
import { Entity } from "../engine/entities";
import { Match } from "../engine/game/match";

export class SameTypeMatch extends Match {
    public canAdd(x: number, y: number, line: Phaser.Types.Math.Vector2Like[]): boolean {
        if (line.length === 0) return true;

        const lastPoint = line[line.length - 1];
        if (lastPoint.x === undefined || lastPoint.y === undefined) return false;

        if (Math.abs(lastPoint.x - x) > 1 || Math.abs(lastPoint.y - y) > 1) return false;
        
        const board = this.getGame().getBoard();

        const lastTile = board.getTile(lastPoint.x ?? -1, lastPoint.y ?? -1);
        if (lastTile === null) return false;

        const lastKey = lastTile.key;
        const pointKey = board.getTile(x, y)?.key;

        return pointKey !== undefined && lastKey !== undefined && pointKey === lastKey;
    }

    public canMatch(line: Phaser.Types.Math.Vector2Like[]): boolean {
        return line.length >= MIN_LINE_LENGTH;
    }

    public match(entity: Entity): void {
        const board = this.getGame().getBoard();
        const line = entity.getLine();

        const lastPoint = line[line.length - 1];
        const lastKey = board.getTile(lastPoint.x ?? -1, lastPoint.y ?? -1)?.key;
        if (lastKey === undefined) return;

        const name = TILE_KEYS[lastKey];
        if (name === undefined) return;

        this.action(name, entity);
    }

    private action(name: TileKey, entity: Entity) {
        const line = entity.getLine();

        switch (name) {
            case "attack":
                this.getGame().getOtherEntities(entity).map((other) => {
                    const length = line.length;
                    
                    const diff = entity.getValue("strength") - other.getValue("defense");
                    const clampDiff = Math.min(Math.max(diff, -10), 10) / 5;

                    const multiplier = (clampDiff < 0) ? (1 / -clampDiff) : (1 + clampDiff / 2);
                    const delta = Math.round(length * multiplier);

                    other.setValue("health", Math.min(other.getValue("health") - delta, MAX_HEALTH));
                });

                break;
            case "strength":
                entity.setValue("strength", entity.getValue("strength") + line.length);
                break;
            case "defense":
                entity.setValue("defense", entity.getValue("defense") + line.length);
                break;
            case "drop":
                entity.setValue("health", MAX_HEALTH);
                break;
            case "heart":
                entity.setValue("health", Math.min(entity.getValue("health") + line.length, MAX_HEALTH));
                break;
        }
    }
}
