import { type SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import { CannonComponent } from "../components/cannon-component";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { EventBus } from "../../engine/utils/eventBus";
import { BubbleType, Events, type BubbleCollisionEvent } from "../utils/enum";
import { TweenComponent } from "../components/tween-component";
import { PositionComponent } from "../components/position-component";
import { ChildComponent } from "../components/child-component";
import { ParentComponent } from "../components/parent-component";
import { BubbleFactory } from "../factories/bubble-factory";
import { SpriteComponent } from "../components/sprite-component";
import { getRandomBubbleType } from "../utils/helpers";
import { CannonReloadComponent } from "../components/cannon-reload-component";
import type { GridService } from "../service/grid-service";
import { GridPositionComponent } from "../components/grid-position-component";
import { BubbleComponent } from "../components/bubble-component";

export class CannonSystem implements SystemInterface {
  readonly COMPONENTS = [CannonComponent];

  private readonly _entityManager: EntityManager;
  private readonly _eventBus: EventBus;
  private readonly _gridService: GridService;
  private readonly _cannon!: Entity;
  private readonly _preshooter!: Entity;

  constructor(
    entityManager: EntityManager,
    eventBus: EventBus,
    gridService: GridService,
    cannon: Entity,
    preshooter: Entity
  ) {
    this._entityManager = entityManager;
    this._eventBus = eventBus;
    this._gridService = gridService;
    this._cannon = cannon;
    this._preshooter = preshooter;

    this._eventBus.on<BubbleCollisionEvent>(Events.BUBBLE_SHOOT, this._handleBubbleShoot);

    this._eventBus.on(Events.RELOAD_CANNON, this._handleBubblePopAfter);
  }

  private _handleBubbleShoot = () => {
    this._reloadCannon();
    this._reloadPrecannon();
  };

  private _handleBubblePopAfter = () => {
    this._cannon.addComponent(new CannonReloadComponent());
  };

  private _reloadCannon() {
    const childComponent = this._preshooter.getComponent(ChildComponent);

    if (!childComponent) {
      console.warn(
        `[CannonSystem::_handleBubbleCollision]: PreShooter entity does not have a ChildComponent.`
      );
      return;
    }

    const preshooterBubble = this._entityManager.get(childComponent.childId);

    if (!preshooterBubble) {
      console.warn(`[CannonSystem::_handleBubbleCollision]: PreShooter bubble not found.`);
      return;
    }

    const cannonPosition = this._cannon.getComponent(PositionComponent)!;
    const preshooterBubblePosition = preshooterBubble.getComponent(PositionComponent)!;

    preshooterBubble.removeComponent(ParentComponent);
    this._preshooter.removeComponent(ChildComponent);

    preshooterBubble.addComponent(
      new TweenComponent([
        {
          id: "shoot",
          mode: "to",
          target: preshooterBubblePosition,
          duration: 0.5,
          to: {
            motionPath: {
              path: [
                {
                  x: preshooterBubblePosition.x,
                  y: preshooterBubblePosition.y,
                },
                { x: cannonPosition.x - 80, y: cannonPosition.y - 125 },
                { x: cannonPosition.x, y: cannonPosition.y - 100 },
              ],
              curviness: 1.5,
              autoRotate: false,
            },
          },
          onComplete: () => {
            this._cannon.addComponent(new ChildComponent(preshooterBubble.getId()));
            preshooterBubble.addComponent(new ParentComponent(this._cannon.getId(), 0, -100));
          },
        },
      ])
    );
  }

  private _reloadPrecannon() {
    let bubbleType = getRandomBubbleType();

    if (this._gridService.getRowsLeft() === 1) {
      const bubbles = this._gridService.getBubbles();
      const bubbleTypes = new Set<number>();

      for (const bubble of bubbles) {
        const bubbleType = bubble.getComponent(BubbleComponent)!.type;
        bubbleTypes.add(bubbleType);
      }

      const randomIndex = Math.floor(Math.random() * bubbleTypes.size);

      bubbleType = Array.from(bubbleTypes)[randomIndex] as BubbleType;
    }

    const bubble = BubbleFactory.createBubble(this._gridService, bubbleType);

    const bubbleSpriteComponent = bubble.getComponent(SpriteComponent)!;

    bubbleSpriteComponent.setScale(0);

    // Don't attach to the grid just yet
    bubble.removeComponent(GridPositionComponent);

    bubble.addComponent(new ParentComponent(this._preshooter.getId(), 0, -100));
    this._preshooter.addComponent(new ChildComponent(bubble.getId()));

    bubble.addComponent(
      new TweenComponent([
        {
          id: "scale",
          mode: "fromTo",
          target: bubbleSpriteComponent,
          duration: 0.3,
          from: {
            scaleX: 0,
            scaleY: 0,
          },
          to: {
            scaleX: 1,
            scaleY: 1,
          },
        },
      ])
    );
  }
}
