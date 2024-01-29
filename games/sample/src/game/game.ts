import { Board, Entity, Game, ProbabilityMap } from "match-game";

import {
  ENTITY_COUNT,
  GRID_HEIGHT,
  GRID_WIDTH,
  MIN_LINE_LENGTH,
  TILE_CONFIGS,
  WIN_SCORE,
} from "./config";
import { SampleMatch } from "./match";
import { ValueKey } from "./types";

/**
 * Main defintion for game.
 *
 * Modify this to add your game logic.
 */
export class SampleGame extends Game<ValueKey> {
  constructor() {
    super();

    /**
     * Create the probabilites of each tile.
     *
     * This is what allows for different types of tiles to appear.
     *
     * MUST BE set first.
     *
     * Uses the configs of {@link TILE_CONFIGS}.
     */
    this.addProbability(
      new ProbabilityMap(
        new Map(
          Object.values(TILE_CONFIGS).map(({ frame, probability }) => [
            frame,
            probability,
          ])
        )
      )
    );

    /**
     * Create the board.
     *
     * Uses the size {@link GRID_WIDTH} by {@link GRID_HEIGHT}.
     */
    this.addBoard(new Board(this, GRID_WIDTH, GRID_HEIGHT));

    /**
     * Create the matching algorithm for the game.
     *
     * Uses {@link MIN_LINE_LENGTH} to define the smallest line length.
     */
    this.addMatch(new SampleMatch(this, MIN_LINE_LENGTH));

    /**
     * Create the entities (with their value).
     *
     * Pass the entity count through the constructor parameters if this can change.
     */
    new Array(ENTITY_COUNT).fill(0).map(() => {
      const entity = new Entity(this, {
        win: 0,
        score: 0,
      });

      this.addEntity(entity);
    });
  }

  public start(): void {
    this.entities.forEach((entity) => entity.setValue("score", 0));

    super.start();
  }

  protected match(entity: Entity<ValueKey>): void {
    // Get the line of the successful match.
    const line = entity.getLine();

    if (this.updateWin()) {
      // Match (remove) the tiles of the line from the board.
      this.board.match(line);

      // Wait for match to be over to change screen.
      this.boardRenderer.onMatch(this.end, this);
    } else {
      this.updateBoard(line);
    }
  }

  private updateBoard(line: Phaser.Geom.Point[]): void {
    // Match (remove) the tiles of the line from the board.
    this.board.match(line);

    // Clear last line.
    this.board.clearLineY(this.board.height - 1);

    // Move tiles down.
    this.board.pullDown();

    // Fill in the empty spots with new random tiles.
    this.board.fill();
  }

  private updateWin(): boolean {
    for (let entity of this.entities) {
      if (entity.getValue("score") >= WIN_SCORE) {
        entity.setValue("win", entity.getValue("win") + 1);

        return true;
      }
    }

    return false;
  }
}
