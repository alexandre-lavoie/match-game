import Phaser from "phaser";
import { Controller } from ".";
import { Entity } from "../entities";
import { AI } from "../ai";

export class AIController extends Controller {
    public static readonly TILE_DURATION = 200;
    public static readonly PLAY_DELAY = 100;

    private readonly ai: AI;
    
    public constructor(scene: Phaser.Scene, entity: Entity, ai: AI) {
        super(scene, entity);
        
        this.ai = ai;
    }

    public override tick(): void {
        const path = this.ai.nextLine(this.entity);

        let previousIndex = -1;
        this.scene.tweens.addCounter({
            from: 0,
            to: path.length,
            duration: AIController.TILE_DURATION * (path.length - 1),
            delay: AIController.PLAY_DELAY + this.entity.getGame().getBoardRenderer().getAnimationDelay(),
            onUpdate: (tween) => {
                const i = Math.floor(tween.getValue());
                if (i === previousIndex) return;
                if (i >= path.length) return;
                previousIndex = i;

                this.select(path[i]?.x ?? -1, path[i]?.y ?? -1);
            },
            onComplete: () => {
                this.match();
            }
        });
    }
}
