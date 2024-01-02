export class ProbabilityMap<T> {
    private map = new Map<T, number>();

    public set(key: T, count: number): this {
        this.map.set(key, count);

        return this;
    }

    public get(key: T): number | undefined {
        return this.map.get(key);
    }

    public random(): T {
        let keyList: T[] = [];
        
        this.map.forEach((count, key) => {
            keyList.push(...new Array(count).fill(key));
        });

        return keyList[Math.floor(Math.random() * keyList.length)];
    }
};
