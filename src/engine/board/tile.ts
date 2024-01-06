export class Tile {
  public readonly key: number;

  public x: number;
  public y: number;

  public constructor(key: number, x: number, y: number) {
    this.key = key;
    this.x = x;
    this.y = y;
  }
}
