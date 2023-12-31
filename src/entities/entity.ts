import Phaser from "phaser";

import { EntityController } from "../controllers/entity";
import { EntityRenderer } from "./renderer";
import { Board } from "../board";
import { MAX_HEALTH } from "../config/game";

export interface EntityConfig {
    readonly health: number;
    readonly strength: number;
    readonly defense: number;
    readonly board: Board;
    readonly stroke?: number;
    readonly fill?: number;
};

export class Entity extends Phaser.GameObjects.Container {
    protected _health: number;
    protected _strength: number;
    protected _defense: number;

    protected board: Board;

    protected controller?: EntityController;
    protected renderer?: EntityRenderer;

    private stroke: number;
    private fill: number;
    private line: Phaser.Geom.Polygon;

    public constructor(scene: Phaser.Scene, config: EntityConfig) {
        super(scene);

        this.board = config.board;

        this._health = config.health;
        this._strength = config.strength;
        this._defense = config.defense;

        this.stroke = config.stroke ?? 1;
        this.fill = config.fill ?? 0;

        this.line = new Phaser.Geom.Polygon();
    }

    public addController(controller: EntityController): this {
        this.controller = controller;

        return this;
    }

    public addRenderer(renderer: EntityRenderer): this {
        this.renderer = renderer;
        this.add(this.renderer);

        return this;
    }

    public get health(): number {
        return this._health;
    }

    public set health(value: number) {
        this._health = Math.min(value, MAX_HEALTH);
    }

    public get strength(): number {
        return this._strength;
    }

    public set strength(value: number) {
        this._strength = value;
    }

    public get defense(): number {
        return this._defense;
    }

    public set defense(value: number) {
        this._defense = value;
    }

    public getBoard(): Board {
        return this.board;
    }

    public getStroke(): number {
        return this.stroke;
    }

    public getFill(): number {
        return this.fill;
    }

    public tick(delay: number = 0) {
        this.controller?.tick(delay);
    }

    public pushPoint(x: number, y: number) {
        this.renderer?.pushPoint(x, y);
        this.line.points.push(new Phaser.Geom.Point(x, y));
    }

    public popPoint(): Phaser.Geom.Point | undefined {
        this.renderer?.popPoint();
        return this.line.points.pop();
    }

    public clearPoints() {
        this.line.points.splice(0, this.line.points.length);
        this.renderer?.clearPoints();
    }

    public containsPoint(x: number, y: number): boolean {
        return this.line.points.some(p => p.x === x && p.y === y);
    }

    public getLine(): Phaser.Geom.Point[] {
        return this.line.points;
    }
}
