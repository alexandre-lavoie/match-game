import { TileKey } from "../../config/tile";
import { Board } from "..";
import { Shield } from "./shield";
import { Sword } from "./sword";
import { Gold } from "./gold";
import { Heart } from "./heart";
import { Tile } from ".";
import { Potion } from "./potion";

export class TileFactory {
    public static fromKey(scene: Phaser.Scene, board: Board, key: TileKey, x: number, y: number): Tile {
        switch (key) {
            case "shield":
                return new Shield(scene, board, x, y);
            case "sword":
                return new Sword(scene, board, x, y);
            case "gold":
                return new Gold(scene, board, x, y);
            case "heart":
                return new Heart(scene, board, x, y);
            case "potion":
                return new Potion(scene, board, x, y);
        }
    }
}
