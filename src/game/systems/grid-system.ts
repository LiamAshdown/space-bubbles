import type { Ticker } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import type { EventBus } from "../../engine/utils/eventBus";
import type { GridService } from "../service/grid-service";
import type { LevelService } from "../service/level-service";
import { Events, type BubblePopAfterEvent } from "../utils/enum";
import { PositionComponent } from "../components/position-component";
import { Timer } from "../../engine/utils/timer";

export class GridSystem implements SystemInterface {
  readonly COMPONENTS = [];

  private _gridService: GridService;
  private _levelService: LevelService;
  private _eventBus: EventBus;
  private _cannon: Entity;
  private _timer: Timer;

  constructor(
    _: EntityManager,
    gridService: GridService,
    levelService: LevelService,
    eventBus: EventBus,
    cannon: Entity
  ) {
    this._gridService = gridService;
    this._levelService = levelService;
    this._eventBus = eventBus;
    this._cannon = cannon;
    this._timer = new Timer(500);

    this._eventBus.on<BubblePopAfterEvent>(Events.BUBBLE_POP_AFTER, this._handleBubblePopAfter);
  }

  private _handleBubblePopAfter = async (event: BubblePopAfterEvent) => {
    if (!event.missed) {
      this._levelService.incrementShot();

      if (this._levelService.canAddRow()) {
        await this._levelService.addRow();
      } else if (this._levelService.canPushRowsDown()) {
        await this._levelService.pushRowsDown();
      }
    }

    this._eventBus.emit(Events.RELOAD_CANNON);
  };

  update(ticker: Ticker, entities: Entity[]): void {
    this._timer.update(ticker.deltaMS);

    if (!this._timer.passed()) {
      return;
    }

    const position = this._cannon.getComponent(PositionComponent)!;

    if (this._gridService.getBubbles().length === 0) {
      this._eventBus.emit(Events.YOU_WIN);
      return;
    }

    const bubbles = this._gridService.getBottomOfGridPosition();

    for (const bubble of bubbles) {
      const bubblePosition = bubble.getComponent(PositionComponent)!;

      if (bubblePosition.distance(position) <= 200 || bubblePosition.y >= position.y) {
        this._eventBus.emit(Events.GAME_OVER);
        return;
      }
    }
  }
}
