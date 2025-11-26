import { type Entity, type Component } from "./types";

export class ComponentStore<T extends Component> {
  private _components = new Map<Entity, T>();

  add(entity: Entity, component: T) {
    this._components.set(entity, component);
  }

  remove(entity: Entity) {
    this._components.delete(entity);
  }

  has(entity: Entity) {
    return this._components.has(entity);
  }

  entries(): IterableIterator<[Entity, T]> {
    return this._components.entries();
  }
}
