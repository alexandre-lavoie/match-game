import Phaser from "phaser";
import { Tile } from ".";
import { TILE_CONFIGS } from "../../config/tile";

export class TileRenderer extends Phaser.GameObjects.Sprite {
    public static readonly MATCH_DURATION = 300;
    public static readonly MATCH_DELAY = 100;

    public static readonly SPAWN_DURATION = 300;

    public static readonly DROP_TILE_DURATION = 300;

    private tile: Tile;

    private selectTween: Phaser.Tweens.Tween | null = null;

    public constructor(tile: Tile) {
        super(tile.scene, 0, 0, "tiles", TILE_CONFIGS[tile.getKey()].frameIndex);

        this.tile = tile;
    }

    public select(offset: number = 0) {
        if (this.selectTween) return;

        this.selectTween = this.scene.tweens.add({
            targets: this,
            ease: "sine.inout",
            scale: 1.25,
            duration: Math.max(200 - offset * 5, 150),
            yoyo: true,
            onComplete: () => {
                this.scale = 1;
                this.selectTween = null;
            }
        });

        this.scene.sound.play("select", {
            rate: 1 + offset * 0.1,
            volume: Math.min(0.5 + offset * 0.1, 1) 
        });
    }

    public match(offset: number = 0) {
        this.scene.tweens.add({
            targets: this,
            ease: "sine.inout",
            duration: TileRenderer.MATCH_DURATION,
            scale: 0,
            delay: offset * TileRenderer.MATCH_DELAY,
            onStart: () => {
                this.scene.sound.play("collect", {
                    rate: 1 + offset * 0.1,
                    volume: Math.min(0.5 + offset * 0.1, 1) 
                });
            },
            onComplete: () => {
                this.tile.destroy(false);
            }
        });
    }

    public spawn(delay: number = 0) {
        this.scale = 0;

        this.scene.tweens.add({
            targets: this,
            ease: "sine.inout",
            duration: TileRenderer.SPAWN_DURATION,
            scale: 1,
            delay,
            onComplete: () => {
                this.scale = 1;
            }
        });
    }

    public action() {}

    public drop(fromY: number, toY: number, delay: number = 0) {
        this.setY(fromY - toY);

        this.scene.tweens.add({
            targets: this,
            duration: TileRenderer.DROP_TILE_DURATION,
            delay,
            y: 0
        });
    }
}
