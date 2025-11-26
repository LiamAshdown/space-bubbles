import type { Ticker } from "pixi.js";
import { EntityManager } from "./entity-manager";
import type { SystemConstructor, SystemInterface } from "./system";

export class SystemRunner {
  private readonly _systems: SystemInterface[] = [];
  private readonly _entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this._entityManager = entityManager;
  }

  addSystem<T extends unknown[]>(SystemClass: SystemConstructor<T>, ...args: T) {
    const system = new SystemClass(this._entityManager, ...args);
    this._systems.push(system);
  }

  getEntityManager() {
    return this._entityManager;
  }

  init() {
    for (const system of this._systems) {
      if (system.init) {
        system.init();
      }
    }
  }

  resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    for (const system of this._systems) {
      if (system.resize) {
        system.resize(logicalWidth, logicalHeight, screenWidth, screenHeight);
      }
    }
  }

  update(ticker: Ticker) {
    const entities = this._entityManager.getAll();

    for (const system of this._systems) {
      const filtered = entities.filter((e) => system.COMPONENTS.every((c) => e.hasComponent(c)));

      system.update?.(ticker, filtered);
    }
  }
}
