import { Entity, type ComponentClass, type ComponentInterface, type EntityId } from "./types";

export class EntityManager {
  private nextId: EntityId = 0;
  private entities = new Map<EntityId, Entity>();

  create(): Entity {
    const entity = new Entity(this.nextId++);
    this.entities.set(entity.id, entity);
    return entity;
  }

  remove(entity: Entity) {
    // Go through the entity's components and call the delete method
    // so the component can properly clean up
    for (const [_, value] of entity.getComponents()) {
      if (value.delete) {
        value.delete();
      }
    }

    this.entities.delete(entity.id);
  }

  get(entityId: EntityId): Entity | undefined {
    return this.entities.get(entityId);
  }

  queryEntities(componentClasses: ComponentClass<ComponentInterface>[]): Entity[] {
    return Array.from(this.entities.values()).filter((entity) =>
      componentClasses.every((c) => entity.hasComponent(c))
    );
  }

  queryEntity(componentClasses: ComponentClass<ComponentInterface>[]): Entity | undefined {
    return this.queryEntities(componentClasses)[0];
  }

  getAll(): Entity[] {
    return Array.from(this.entities.values());
  }
}
