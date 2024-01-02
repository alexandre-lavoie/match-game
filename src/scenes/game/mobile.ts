import { GameScene } from ".";

export class MobileGameScene extends GameScene {
    protected preloadDevice(): void {
        this.load.image("board", "./assets/art/boards/mobile.png");
        this.load.spritesheet("tiles", "./assets/art/tiles/mobile.png", { 
            frameWidth: 48,
            frameHeight: 48
        });
        this.load.image("enemy", "./assets/art/enemies/human/mobile.png");
    }

    protected getFontSize(): number {
        return 16;
    }

    protected getStroke(): number {
        return 15;
    }

    protected getBoardPlacement(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(0.5, 0.75);
    }

    protected getEnemyPlacement(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(0.5, 0.25);
    }
}
