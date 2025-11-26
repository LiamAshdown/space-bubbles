import type { Ticker } from "pixi.js";
import type { SystemInterface } from "../../engine/ecs/system";
import { PositionComponent } from "../components/position-component";
import { SpriteComponent } from "../components/sprite-component";
import type { Entity } from "../../engine/ecs/types";

export class PositionSystem implements SystemInterface {
  readonly COMPONENTS = [PositionComponent, SpriteComponent];

  update(_: Ticker, entities: Entity[]): void {
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent)!;
      const sprite = entity.getComponent(SpriteComponent)!;

      sprite.updatePosition(position.x, position.y);
    }
  }
}
