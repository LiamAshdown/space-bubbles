import type { Ticker } from "pixi.js";
import type { SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import { TweenComponent } from "../components/tween-component";
import gsap from "gsap";

export class TweenSystem implements SystemInterface {
  COMPONENTS = [TweenComponent];

  update(_: Ticker, entities: Entity[]) {
    for (const entity of entities) {
      const tweenComponent = entity.getComponent(TweenComponent)!;

      for (const [id, tweenDefinition] of tweenComponent.tweens.entries()) {
        if (!tweenDefinition.tween) {
          if (tweenDefinition.mode === "fromTo" && tweenDefinition.from && tweenDefinition.to) {
            tweenDefinition.tween = gsap.fromTo(tweenDefinition.target, tweenDefinition.from, {
              ...tweenDefinition.to,
              duration: tweenDefinition.duration,
              ease: tweenDefinition.ease,
              onComplete: () => {
                tweenDefinition.onComplete?.();
                tweenComponent.tweens.delete(id);
              },
              onUpdate: () => tweenDefinition.onUpdate?.(),
            });
          } else {
            tweenDefinition.tween = gsap.to(tweenDefinition.target, {
              ...tweenDefinition.to,
              duration: tweenDefinition.duration,
              ease: tweenDefinition.ease,
              onComplete: () => {
                tweenDefinition.onComplete?.();
                tweenComponent.tweens.delete(id);
              },
              onUpdate: () => tweenDefinition.onUpdate?.(),
            });
          }
        }
      }
    }
  }
}
