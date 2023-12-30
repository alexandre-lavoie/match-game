import Phaser from "phaser";

export class Tile extends Phaser.GameObjects.Sprite {
    public static readonly SIZE = 128;
    public static readonly KEYS = ["shield", "skull", "sword"];

    private selecting: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
    }

    public selectAnimate(offset: number = 0) {
        if (this.selecting) return;
        this.selecting = true;
        
        this.scene.sound.play("select", {
            rate: 1 + offset * 0.1,
            volume: Math.min(0.5 + offset * 0.1, 1) 
        });

        this.scene.tweens.add({
            targets: this,
            ease: "sine.inout",
            scale: 1.25,
            duration: Math.max(200 - offset * 5, 150),
            yoyo: true,
            onComplete: () => {
                this.selecting = false;
                this.scale = 1;
            }
        })
    }

    public textureAnimate(tileId: number, offset: number = 0) {
        this.scene.tweens.add({
            targets: this,
            scale: 0,
            ease: "sine.inout",
            duration: 300,
            delay: offset * 100,
            yoyo: true,
            onStart: () => {
                this.scene.sound.play("collect", {
                    rate: 1 + offset * 0.1,
                    volume: Math.min(0.5 + offset * 0.1, 1)
                });
            },
            onYoyo: () => {
                this.setTexture(Tile.KEYS[tileId]);
            },
            onComplete: () => {
                this.scale = 1;
            }
        });
    }
}
