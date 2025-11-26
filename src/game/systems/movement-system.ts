import type { Container, Ticker } from "pixi.js";
import { Rectangle } from "pixi.js";
import type { SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import { PositionComponent } from "../components/position-component";
import { VelocityComponent } from "../components/velocity-component";
import { BubbleComponent } from "../components/bubble-component";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { EventBus } from "../../engine/utils/eventBus";
import { Events, type BubblePopAfterEvent } from "../utils/enum";

export class MovementSystem implements SystemInterface {
  COMPONENTS = [PositionComponent, VelocityComponent, BubbleComponent];

  private readonly _container: Container;
  private readonly _entityManager: EntityManager;
  private readonly _eventBus: EventBus;

  constructor(entityManager: EntityManager, container: Container, eventBus: EventBus) {
    this._entityManager = entityManager;
    this._container = container;
    this._eventBus = eventBus;
  }

  update(_: Ticker, entities: Entity[]) {
    for (const entity of entities) {
      const position = entity.getComponent(PositionComponent)!;
      const velocity = entity.getComponent(VelocityComponent)!;
      const bubble = entity.getComponent(BubbleComponent)!;

      if (!this._checkWallCollision(position, velocity, bubble)) {
        // Remove entity and emit the event so cannon can shoot again
        this._entityManager.remove(entity);
        this._eventBus.emit<BubblePopAfterEvent>(Events.BUBBLE_POP_AFTER, {
          missed: true,
        });

        return;
      }

      position.x += velocity.vx;
      position.y += velocity.vy;
    }
  }

  private _checkWallCollision(
    position: PositionComponent,
    velocity: VelocityComponent,
    bubble: BubbleComponent
  ): boolean {
    const hitArea = this._container.hitArea as Rectangle;

    if (position.x - bubble.radius < 0) {
      position.x = bubble.radius;
      velocity.vx = Math.abs(velocity.vx);
    } else if (position.x + bubble.radius > hitArea.width) {
      position.x = hitArea.width - bubble.radius;
      velocity.vx = -Math.abs(velocity.vx);
    }

    if (position.y - bubble.radius < 0) {
      return false;
    } else if (position.y + bubble.radius > hitArea.height) {
      position.y = hitArea.height - bubble.radius;
      velocity.vy = -Math.abs(velocity.vy);
    }

    return true;
  }
}
