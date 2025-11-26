import type { Ticker } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import { ParentComponent } from "../components/parent-component";
import { PositionComponent } from "../components/position-component";

export class ParentSystem implements SystemInterface {
  readonly COMPONENTS = [ParentComponent, PositionComponent];

  private readonly _entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this._entityManager = entityManager;
  }

  update(_: Ticker, entitys: Entity[]): void {
    for (const entity of entitys) {
      const parent = entity.getComponent(ParentComponent)!;

      const parentEntity = this._entityManager.get(parent.parentId);

      if (!parentEntity) {
        console.warn(`Parent entity with ID ${parent.parentId} not found.`);
        continue;
      }

      const parentPosition = parentEntity.getComponent(PositionComponent)!;
      const entityPosition = entity.getComponent(PositionComponent)!;

      const targetX = parentPosition.x + parent.offsetX;
      const targetY = parentPosition.y + parent.offsetY;

      entityPosition.x += (targetX - entityPosition.x) * parent.lerpSpeed;
      entityPosition.y += (targetY - entityPosition.y) * parent.lerpSpeed;
    }
  }
}
