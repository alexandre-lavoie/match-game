import { GameScene } from "../game";

export class SmallGameScene extends GameScene {
  public constructor() {
    super("small");
  }

  protected preloadDevice(): void {
    this.load.image("small-board", "./assets/art/boards/mobile.png");

    this.load.spritesheet("small-tiles", "./assets/art/tiles/mobile.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.image("small-enemy", "./assets/art/enemies/human/mobile.png");
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

  protected getEnemyFlip(): boolean {
    return false;
  }

  protected getEnemyPlacement(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0.5, 0.25);
  }
}
