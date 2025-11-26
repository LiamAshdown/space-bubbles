import type { Ticker } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { SystemInterface } from "../../engine/ecs/system";
import { PositionComponent } from "../components/position-component";
import { VelocityComponent } from "../components/velocity-component";
import type { Entity } from "../../engine/ecs/types";
import { GridPositionComponent } from "../components/grid-position-component";
import { collisionDetected } from "../utils/helpers";
import type { EventBus } from "../../engine/utils/eventBus";
import { Events, type BubbleCollisionEvent } from "../utils/enum";
import { BubbleComponent } from "../components/bubble-component";

export class BubbleCollisionSystem implements SystemInterface {
  COMPONENTS = [PositionComponent, VelocityComponent, BubbleComponent];

  private _entityManager: EntityManager;
  private _eventBus: EventBus;

  constructor(entityManager: EntityManager, eventBus: EventBus) {
    this._entityManager = entityManager;
    this._eventBus = eventBus;
  }

  update(_: Ticker, entities: Entity[]) {
    for (const entity of entities) {
      this._checkCollision(entity);
    }
  }

  _checkCollision(entity: Entity) {
    const gridBubbles = this._entityManager.queryEntities([
      GridPositionComponent,
      PositionComponent,
      BubbleComponent,
    ]);

    const position = entity.getComponent(PositionComponent)!;
    const velocity = entity.getComponent(VelocityComponent)!;
    const bubble = entity.getComponent(BubbleComponent)!;

    const radius = bubble.radius;

    // Check collision with grid bubbles
    for (const gridBubble of gridBubbles) {
      const gridPos = gridBubble.getComponent(PositionComponent)!;
      const gridBubbleComp = gridBubble.getComponent(BubbleComponent)!;

      if (
        collisionDetected(
          position.x,
          position.y,
          radius / 2, // Use half radius for moving bubble for better fit
          gridPos.x,
          gridPos.y,
          gridBubbleComp.radius
        )
      ) {
        this._eventBus.emit<BubbleCollisionEvent>(Events.BUBBLE_COLLISION, {
          bubbleA: entity.id,
          bubbleB: gridBubble.id,
          velocityX: velocity.vx,
          velocityY: velocity.vy,
        });

        entity.removeComponent(VelocityComponent);

        break;
      }
    }
  }
}
