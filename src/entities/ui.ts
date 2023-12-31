import Phaser from "phaser";
import { Entity } from "./entity";

export class EntityUI extends Phaser.GameObjects.Container {
    private entity: Entity;

    private healthText: Phaser.GameObjects.Text;
    private strengthText: Phaser.GameObjects.Text;
    private defenseText: Phaser.GameObjects.Text;

    public constructor(entity: Entity, x: number = 0, y: number = 0) {
        super(entity.scene, x, y);

        this.entity = entity;

        this.healthText = new Phaser.GameObjects.Text(this.scene, 0, 0, "Health: 0", {
            font: "bold 16px Arial"
        });
        this.add(this.healthText);

        this.strengthText = new Phaser.GameObjects.Text(this.scene, 128, 0, "Strength: 0", {
            font: "bold 16px Arial"
        });
        this.add(this.strengthText);

        this.defenseText = new Phaser.GameObjects.Text(this.scene, 256, 0, "Defense: 0", {
            font: "bold 16px Arial"
        });
        this.add(this.defenseText);

        setInterval(() => {
            this.healthText.text = `Health: ${this.entity.health}`;
            this.strengthText.text = `Strength: ${this.entity.strength}`;
            this.defenseText.text = `Defense: ${this.entity.defense}`;
        }, 100);
    }
}
