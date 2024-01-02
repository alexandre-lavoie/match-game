import { GameScene } from ".";

export class DesktopGameScene extends GameScene {
    protected preloadDevice(): void {
        this.load.image("board", "./assets/art/boards/desktop.png");
        this.load.spritesheet("tiles", "./assets/art/tiles/desktop.png", { 
            frameWidth: 88, 
            frameHeight: 88
        });
        this.load.image("enemy", "./assets/art/enemies/human/desktop.png");
    }

    protected getFontSize(): number {
        return 32;
    }

    protected getStroke(): number {
        return 30;    
    }

    protected getBoardPlacement(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(0.25, 0.5);
    }

    protected getEnemyPlacement(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(0.75, 0.5);
    }
}
