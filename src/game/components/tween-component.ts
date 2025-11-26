import type { ComponentInterface } from "../../engine/ecs/types";
import { generateRandomId } from "../utils/helpers";

export interface TweenDefinition {
  id: string;
  target: string | object | null;
  mode?: "to" | "fromTo";
  from?: Partial<gsap.TweenVars>;
  to?: Partial<gsap.TweenVars>;
  duration: number;
  ease?: "power1.inOut" | string;
  onComplete?: () => void;
  onUpdate?: () => void;
  tween?: gsap.core.Tween;
}

export class TweenComponent implements ComponentInterface {
  public tweens: Map<string, TweenDefinition> = new Map();

  constructor(
    tweens: (Omit<TweenDefinition, "id"> & {
      id?: string;
    })[] = []
  ) {
    for (const tween of tweens) {
      if (!tween.id) {
        tween.id = generateRandomId();
      }

      this.tweens.set(tween.id, tween as TweenDefinition);
    }
  }

  addTween(
    tween: Omit<TweenDefinition, "id"> & {
      id?: string;
    }
  ) {
    if (!tween.id) {
      tween.id = generateRandomId();
    }

    this.tweens.set(tween.id, tween as TweenDefinition);
  }

  removeTween(id: string) {
    const activeTween = this.tweens.get(id);
    if (activeTween) {
      activeTween.tween?.kill();
      this.tweens.delete(id);
    }
  }

  hasTweens(): boolean {
    return this.tweens.size > 0;
  }

  delete?(): void;
}
