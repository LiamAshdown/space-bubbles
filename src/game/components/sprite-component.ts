import type { Sprite } from "pixi.js";
import type { ComponentInterface } from "../../engine/ecs/types";

export class SpriteComponent implements ComponentInterface {
  public sprite: Sprite;

  constructor(sprite: Sprite) {
    this.sprite = sprite;
  }

  delete() {
    if (this.sprite.parent) {
      this.sprite.removeFromParent();
    }
  }

  updatePosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setScale(scale: number) {
    this.sprite.scale.set(scale);
  }

  set scaleX(scaleX: number) {
    this.sprite.scale.x = scaleX;
  }

  set scaleY(scaleY: number) {
    this.sprite.scale.y = scaleY;
  }

  get scaleX(): number {
    return this.sprite.scale.x;
  }

  get scaleY(): number {
    return this.sprite.scale.y;
  }
}
