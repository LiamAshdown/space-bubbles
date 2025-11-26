import type { Entity } from "../../engine/ecs/types";
import { type SystemInterface } from "../../engine/ecs/system";
import { InputEvents, type InputManager } from "../../engine/input/input-manager";
import { ChildComponent } from "../components/child-component";
import { PositionComponent } from "../components/position-component";
import { VelocityComponent } from "../components/velocity-component";
import { ParentComponent } from "../components/parent-component";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { EventBus } from "../../engine/utils/eventBus";
import { Events } from "../utils/enum";
import { CannonReloadComponent } from "../components/cannon-reload-component";

export class CannonInputSystem implements SystemInterface {
  readonly COMPONENTS = [];

  private readonly _inputManager: InputManager;
  private readonly _entityManager: EntityManager;
  private readonly _cannon: Entity;
  private readonly _eventBus: EventBus;

  constructor(
    entityManager: EntityManager,
    cannon: Entity,
    inputManager: InputManager,
    eventBus: EventBus
  ) {
    this._inputManager = inputManager;
    this._entityManager = entityManager;
    this._cannon = cannon;
    this._eventBus = eventBus;
  }

  init(): void {
    this._inputManager.on(InputEvents.MOUSE_DOWN, this._handleCannonFire.bind(this));
  }

  private _handleCannonFire(event: MouseEvent): void {
    // Can't fire if there's no child (projectile) to fire
    if (
      !this._cannon.hasComponent(ChildComponent) ||
      !this._cannon.hasComponent(CannonReloadComponent)
    ) {
      return;
    }

    const childComponent = this._cannon.getComponent(ChildComponent)!;
    const childEntity = this._entityManager.get(childComponent.childId);

    if (!childEntity) {
      console.warn("[CannonInputSystem] Cannon has no child entity");
      return;
    }

    const positionComponent = childEntity.getComponent(PositionComponent);
    if (!positionComponent) {
      console.warn("[CannonInputSystem] Child entity has no position component");
      return;
    }

    const dx = event.x - positionComponent.x;
    const dy = event.y - positionComponent.y;
    const angle = Math.atan2(dy, dx);
    const speed = 15;

    childEntity.addComponent(
      new VelocityComponent(Math.cos(angle) * speed, Math.sin(angle) * speed)
    );
    childEntity.removeComponent(ParentComponent);

    this._cannon.removeComponent(ChildComponent);
    this._cannon.removeComponent(CannonReloadComponent);

    this._eventBus.emit(Events.BUBBLE_SHOOT);
  }
}
