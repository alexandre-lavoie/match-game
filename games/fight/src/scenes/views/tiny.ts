import { GameScene } from "../game";

export class TinyGameScene extends GameScene {
  public constructor() {
    super("tiny");
  }

  protected preloadDevice(): void {
    this.load.image("tiny-board", "./assets/art/boards/mobile.png");

    this.load.spritesheet("tiny-tiles", "./assets/art/tiles/mobile.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.image("tiny-enemy", "./assets/art/enemies/human/mobile.png");
  }

  protected getFontSize(): number {
    return 16;
  }

  protected getStroke(): number {
    return 15;
  }

  protected getBoardPlacement(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0.5, 0.5);
  }

  protected getEnemyFlip(): boolean {
    return false;
  }

  protected getEnemyPlacement(): null {
    return null;
  }
}
