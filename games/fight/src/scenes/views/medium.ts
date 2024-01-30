import { GameScene } from "../game";

export class MediumGameScene extends GameScene {
  public constructor() {
    super("medium");
  }

  protected preloadDevice(): void {
    this.load.image("medium-board", "./assets/art/boards/mobile.png");

    this.load.spritesheet("medium-tiles", "./assets/art/tiles/mobile.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.image("medium-enemy", "./assets/art/enemies/human/mobile.png");
  }

  protected getFontSize(): number {
    return 16;
  }

  protected getStroke(): number {
    return 15;
  }

  protected getBoardPlacement(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0.25, 0.5);
  }

  protected getEnemyFlip(): boolean {
    return true;
  }

  protected getEnemyPlacement(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0.75, 0.5);
  }
}
