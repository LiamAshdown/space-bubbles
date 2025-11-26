import type { Ticker } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { SystemInterface } from "../../engine/ecs/system";
import type { InputManager } from "../../engine/input/input-manager";
import { GraphicsComponent } from "../components/graphics-component";
import { ParentComponent } from "../components/parent-component";
import type { Entity } from "../../engine/ecs/types";
import { PositionComponent } from "../components/position-component";
import { ChildComponent } from "../components/child-component";

export class GuideLineSystem implements SystemInterface {
  COMPONENTS = [GraphicsComponent, ParentComponent];

  private readonly _entityManager: EntityManager;
  private readonly _inputManager: InputManager;

  private static readonly MAX_DOTS = 8;
  private static readonly DOT_SPACING = 50; // pixels between dots
  private static readonly DOT_RADIUS = 10;
  private static readonly DOT_COLOR = 0xffffff;

  constructor(entityManager: EntityManager, inputManager: InputManager) {
    this._entityManager = entityManager;
    this._inputManager = inputManager;
  }

  update(_: Ticker, entities: Entity[]) {
    for (const entity of entities) {
      const gfx = entity.getComponent(GraphicsComponent)!.gfx;
      const parentComp = entity.getComponent(ParentComponent)!;
      const parentEntity = this._entityManager.get(parentComp.parentId);

      if (!parentEntity) {
        console.warn(`Parent entity with ID ${parentComp.parentId} not found.`);
        continue;
      }

      const childComponent = parentEntity.getComponent(ChildComponent);
      if (!childComponent) {
        continue;
      }

      const bubbleEntity = this._entityManager.get(childComponent.childId);
      if (!bubbleEntity) {
        continue;
      }

      const bubblePosition = bubbleEntity.getComponent(PositionComponent)!;
      const mousePos = this._inputManager.getMousePosition();

      gfx.clear();

      const dx = mousePos.x - bubblePosition.x;
      const dy = mousePos.y - bubblePosition.y;
      const dist = Math.hypot(dx, dy);

      const maxDots = GuideLineSystem.MAX_DOTS;
      const spacing = GuideLineSystem.DOT_SPACING;
      const dotCount = Math.min(maxDots, Math.max(0, Math.floor(dist / spacing)));

      const ux = dx / dist;
      const uy = dy / dist;

      for (let i = 1; i <= dotCount; i++) {
        const t = i * spacing;

        if (t >= dist) {
          break;
        }

        const x = bubblePosition.x + ux * t;
        const y = bubblePosition.y + uy * t;

        const alpha = 1 - (i - 1) / Math.max(1, dotCount);
        gfx
          .circle(x, y, GuideLineSystem.DOT_RADIUS - i * 0.5)
          .fill({ color: GuideLineSystem.DOT_COLOR, alpha });
      }
    }
  }
}
