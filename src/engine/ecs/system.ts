import type { Ticker } from "pixi.js";
import type { ComponentClass, ComponentInterface, Entity } from "./types";
import type { EntityManager } from "./entity-manager";

export interface SystemInterface {
  readonly COMPONENTS: ComponentClass<ComponentInterface>[];

  update?: (ticker: Ticker, entities: Entity[]) => void;
  init?: () => void;
  resize?: (
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ) => void;
}

// T must be an unknown array types
export interface SystemConstructor<T extends unknown[] = unknown[]> {
  new (entityManager: EntityManager, ...args: T): SystemInterface;
}
