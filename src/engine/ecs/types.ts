export type EntityId = number;

export interface ComponentInterface {
  delete?: () => void;
}

export type ComponentClass<T extends ComponentInterface> = abstract new (...args: never[]) => T;

export class Entity {
  public id: EntityId;

  private components = new Map<ComponentClass<ComponentInterface>, ComponentInterface>();

  constructor(id: EntityId) {
    this.id = id;
  }

  getId(): EntityId {
    return this.id;
  }

  getComponents(): Map<ComponentClass<ComponentInterface>, ComponentInterface> {
    return this.components;
  }

  // Add a component
  addComponent<T extends ComponentInterface>(component: T) {
    this.components.set(component.constructor as ComponentClass<T>, component);
  }

  getComponent<T extends ComponentInterface>(cls: ComponentClass<T>): T | undefined {
    return this.components.get(cls) as T | undefined;
  }

  // Check if entity has a component
  hasComponent<T extends ComponentInterface>(cls: ComponentClass<T>): boolean {
    return this.components.has(cls);
  }

  // Remove a component
  removeComponent<T extends ComponentInterface>(cls: ComponentClass<T>) {
    this.components.delete(cls);
  }
}
