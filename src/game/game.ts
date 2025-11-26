import { Container, Rectangle, type Ticker } from "pixi.js";
import { EntityManager } from "../engine/ecs/entity-manager";
import { SystemRunner } from "../engine/ecs/system-runner";
import type { Entity } from "../engine/ecs/types";
import { CannonFactory } from "./factories/cannon-factory";
import { InputManager } from "../engine/input/input-manager";
import { CannonSystem } from "./systems/cannon-system";
import { CannonInputSystem } from "./systems/cannon-input-system";
import { EventBus } from "../engine/utils/eventBus";
import { PositionComponent } from "./components/position-component";
import { ParentSystem } from "./systems/parent-system";
import { PositionSystem } from "./systems/position-system";
import { GuideLineSystem } from "./systems/guide-line-system";
import { MovementSystem } from "./systems/movement-system";
import { BubbleCollisionSystem } from "./systems/bubble-collision-system";
import { TweenSystem } from "./systems/tween-system";
import { BubblePopSystem } from "./systems/bubble-pop-system";
import { GridService } from "./service/grid-service";
import { LevelService } from "./service/level-service";
import { GridSystem } from "./systems/grid-system";
import { Events } from "./utils/enum";
import type { Sound } from "../engine/sound/sound";
import { ChildComponent } from "./components/child-component";
import { ParentComponent } from "./components/parent-component";

const GAME_STATE = {
  RUNNING: 0,
  LOADING: 1,
  GAME_OVER: 2,
};

export class Game {
  private _level: number;
  private _entityManager: EntityManager;
  private _systemRunner: SystemRunner;
  private _inputManager!: InputManager;
  private _levelService: LevelService;
  private _gridService: GridService;
  private _state: number = GAME_STATE.RUNNING;
  private readonly _sound: Sound;

  private _cannon!: Entity;
  private _preShooter!: Entity;
  private _container: Container;
  private _onGameOverCallback?: (() => void) | null = null;
  private _onGameWinCallback?: (() => void) | null = null;
  private _onGameLoading?: (() => void) | null = null;
  private _onGameStart?: (() => void) | null = null;

  constructor(container: Container, level: number, sound: Sound) {
    this._level = level;
    this._entityManager = new EntityManager();
    this._systemRunner = new SystemRunner(this._entityManager);
    this._inputManager = new InputManager(container);
    this._sound = sound;

    this._gridService = new GridService(this._entityManager, container);
    this._levelService = new LevelService(this._gridService);

    this._container = container;

    this._initializeGameEntities();
    this._initializeSystems();
  }

  public update(ticker: Ticker) {
    if (this._state === GAME_STATE.GAME_OVER) {
      return;
    }

    this._systemRunner.update(ticker);
  }

  public async start() {
    if (this._onGameLoading) {
      this._onGameLoading();
    }

    await this._levelService.start(this._level);
    this._inputManager.addListeners();
    this._state = GAME_STATE.RUNNING;

    if (this._onGameStart) {
      this._onGameStart();
    }
  }

  public stop() {
    this._inputManager.removeListeners();

    this._state = GAME_STATE.GAME_OVER;
  }

  public resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._systemRunner.resize(logicalWidth, logicalHeight, screenWidth, screenHeight);

    this._positionGameEntities(logicalWidth, logicalHeight);
  }

  public onGameOver(callback: () => void) {
    this._onGameOverCallback = callback;
  }

  public onGameYouWin(callback: () => void) {
    this._onGameWinCallback = callback;
  }

  public onGameLoading(callback: () => void) {
    this._onGameLoading = callback;
  }

  public onGameStart(callback: () => void) {
    this._onGameStart = callback;
  }

  public swap() {
    const cannonBubble = this._cannon.getComponent(ChildComponent)!;
    const preshooterBubble = this._preShooter.getComponent(ChildComponent)!;

    if (!cannonBubble.childId || !preshooterBubble.childId) {
      return;
    }

    const cannonBubbleEntity = this._entityManager.get(cannonBubble.childId)!;
    const preshooterBubbleEntity = this._entityManager.get(preshooterBubble.childId)!;

    this._cannon.removeComponent(ChildComponent);
    this._preShooter.removeComponent(ChildComponent);

    this._cannon.addComponent(new ChildComponent(preshooterBubbleEntity.id));
    this._preShooter.addComponent(new ChildComponent(cannonBubbleEntity.id));

    cannonBubbleEntity.removeComponent(ParentComponent);
    preshooterBubbleEntity.removeComponent(ParentComponent);

    cannonBubbleEntity.addComponent(new ParentComponent(this._preShooter.id, 0, -100));
    preshooterBubbleEntity.addComponent(new ParentComponent(this._cannon.id, 0, -100));
  }

  private _initializeGameEntities() {
    this._cannon = CannonFactory.createCannon(this._gridService);
    this._preShooter = CannonFactory.createPreShooter(this._gridService);
  }

  private _initializeSystems() {
    this._systemRunner = new SystemRunner(this._entityManager);

    const systemEventBus = new EventBus();

    this._systemRunner.addSystem(
      CannonSystem,
      systemEventBus,
      this._gridService,
      this._cannon,
      this._preShooter
    );
    this._systemRunner.addSystem(
      CannonInputSystem,
      this._cannon,
      this._inputManager,
      systemEventBus
    );
    this._systemRunner.addSystem(ParentSystem);
    this._systemRunner.addSystem(PositionSystem);
    this._systemRunner.addSystem(GuideLineSystem, this._inputManager);
    this._systemRunner.addSystem(MovementSystem, this._container, systemEventBus);
    this._systemRunner.addSystem(BubbleCollisionSystem, systemEventBus);
    this._systemRunner.addSystem(BubblePopSystem, systemEventBus, this._gridService, this._sound);
    this._systemRunner.addSystem(TweenSystem);
    this._systemRunner.addSystem(
      GridSystem,
      this._gridService,
      this._levelService,
      systemEventBus,
      this._cannon
    );

    this._events(systemEventBus);

    this._systemRunner.init();
  }

  private _events(systemEventBus: EventBus): void {
    systemEventBus.on(Events.GAME_OVER, () => {
      if (this._onGameOverCallback) {
        this._onGameOverCallback();
      }
      this.stop();
    });

    systemEventBus.on(Events.YOU_WIN, () => {
      if (this._onGameWinCallback) {
        this._onGameWinCallback();
      }

      this._levelService.complete();

      this.stop();
    });
  }

  private _positionGameEntities(logicalWidth: number, logicalHeight: number): void {
    let position = this._cannon.getComponent(PositionComponent)!;
    position.set(logicalWidth / 2, logicalHeight - 150);
    position = this._preShooter.getComponent(PositionComponent)!;
    position.set(logicalWidth * 0.15, logicalHeight - 125);

    this._container.hitArea = new Rectangle(0, 0, logicalWidth, logicalHeight / 1.25);
    this._container.interactive = true;
  }
}
