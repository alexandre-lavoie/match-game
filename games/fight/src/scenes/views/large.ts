import { GameScene } from "../game";

export class LargeGameScene extends GameScene {
  public constructor() {
    super("large");
  }

  protected preloadDevice(): void {
    this.load.image("large-board", "./assets/art/boards/desktop.png");

    this.load.spritesheet("large-tiles", "./assets/art/tiles/desktop.png", {
      frameWidth: 88,
      frameHeight: 88,
    });

    this.load.image("large-enemy", "./assets/art/enemies/human/desktop.png");
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

  protected getEnemyFlip(): boolean {
    return false;
  }

  protected getEnemyPlacement(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(0.75, 0.5);
  }
}
