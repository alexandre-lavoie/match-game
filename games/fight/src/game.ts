import { Board, Entity, Game, ProbabilityMap } from "match-game";

import { MAX_HEALTH } from "./config";
import { SameTypeMatch } from "./match";
import { TILE_CONFIGS } from "./tile";

type ValueKey = "health" | "strength" | "defense";

export class FightGame extends Game<ValueKey> {
  public constructor() {
    super();

    const probabilityMap = new ProbabilityMap<number>();
    Object.values(TILE_CONFIGS).forEach((config, i) =>
      probabilityMap.set(i, config.probability)
    );
    this.addProbability(probabilityMap);

    this.addMatch(new SameTypeMatch(this));

    const board = new Board(this, 6);
    this.addBoard(board);

    const player = new Entity(this, {
      health: MAX_HEALTH,
      strength: 1,
      defense: 1,
    });
    this.addEntity(player);

    const ai = new Entity(this, {
      health: MAX_HEALTH,
      strength: 1,
      defense: 1,
    });
    this.addEntity(ai);
  }

  protected async match(entity: Entity<ValueKey>): Promise<boolean> {
    const board = this.getBoard();

    const line = [...entity.getLine()];

    board.match(line);

    if (entity === this.getPlayer()) board.pullDown();
    else board.pullUp();

    board.fill();

    return true;
  }

  public getPlayer(): Entity<ValueKey> {
    return this.getEntity(0)!;
  }

  public getEnemy(): Entity<ValueKey> {
    return this.getEntity(1)!;
  }
}
