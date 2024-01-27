/**
 * A ratio-based probability object.
 *
 * Example: Given {X: 1, Y: 2, Z: 3} as a map, {@link random} will have the probabilities (X, 1/5), (Y, 2/5), (Z, 3/5).
 */
export class ProbabilityMap<T> {
  private map = new Map<T, number>();

  /**
   * Set the ratio for a {@link key}.
   *
   * @param key
   * @param count ratio count of key.
   * @returns This for chaining.
   */
  public set(key: T, count: number): this {
    this.map.set(key, count);

    return this;
  }

  /**
   * Get ratio of a {@link key}.
   *
   * @param key
   * @returns ratio. Undefined if key is not found.
   */
  public get(key: T): number | undefined {
    return this.map.get(key);
  }

  /**
   * Get a random value of {@link T} based on the ratios provided.
   *
   * @returns a random value of {@link T}.
   */
  public random(): T {
    let keyList: T[] = [];

    this.map.forEach((count, key) => {
      keyList.push(...new Array(count).fill(key));
    });

    return keyList[Math.floor(Math.random() * keyList.length)];
  }
}
