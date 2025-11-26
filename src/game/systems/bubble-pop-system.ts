import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { SystemInterface } from "../../engine/ecs/system";
import type { Entity } from "../../engine/ecs/types";
import type { EventBus } from "../../engine/utils/eventBus";
import { BubbleComponent } from "../components/bubble-component";
import { GridPositionComponent } from "../components/grid-position-component";
import { PositionComponent } from "../components/position-component";
import { SpriteComponent } from "../components/sprite-component";
import { TweenComponent } from "../components/tween-component";
import type { GridService } from "../service/grid-service";
import {
  BubbleType,
  Events,
  type BubbleCollisionEvent,
  type BubblePopAfterEvent,
} from "../utils/enum";
import { getDirectionFromVelocity, getRandomInt } from "../utils/helpers";
import { ExplosionFactory } from "../factories/explosion-factory";
import type { Sound } from "../../engine/sound/sound";

export class BubblePopSystem implements SystemInterface {
  COMPONENTS = [];
  private readonly _entityManager: EntityManager;
  private readonly _eventBus: EventBus;
  private readonly _gridService: GridService;
  private readonly _sound: Sound;

  constructor(
    entityManager: EntityManager,
    eventBus: EventBus,
    gridService: GridService,
    sound: Sound
  ) {
    this._entityManager = entityManager;
    this._eventBus = eventBus;
    this._gridService = gridService;
    this._sound = sound;

    this._eventBus.on<BubbleCollisionEvent>(
      Events.BUBBLE_COLLISION,
      this._handleBubbleCollision.bind(this)
    );
  }

  private _handleBubbleCollision(event: BubbleCollisionEvent) {
    const { bubbleA, bubbleB, velocityX, velocityY } = event;

    const movingBubble = this._entityManager.get(bubbleA);
    const collidedBubble = this._entityManager.get(bubbleB);

    if (!movingBubble || !collidedBubble) {
      console.warn(`[BubblePopSystem] Missing entities for IDs: ${bubbleA}, ${bubbleB}`);
      return;
    }

    const position = this._getPositionInGrid(movingBubble);
    if (!position) {
      return;
    }

    const movingType = movingBubble.getComponent(BubbleComponent)!.type;
    const worldPos = this._gridService.gridToWorld(position.row, position.col);
    const velocityDir = getDirectionFromVelocity(velocityX, velocityY);

    this._sound.play("blop");

    this._animateCollisionSequence(movingBubble, worldPos, velocityDir, position, movingType);

    this._pushNeighbours(movingBubble, position);
  }

  private _animateCollisionSequence(
    bubble: Entity,
    gridWorldPos: { x: number; y: number },
    velocityDir: { x: number; y: number },
    gridPos: { col: number; row: number },
    type: BubbleType
  ) {
    const pos = bubble.getComponent(PositionComponent)!;
    const bounceDistance = 25;

    bubble.addComponent(
      new TweenComponent([
        {
          mode: "to",
          target: pos,
          to: {
            x: pos.x + velocityDir.x * bounceDistance,
            y: pos.y + velocityDir.y * bounceDistance,
          },
          duration: 0.15,
          onComplete: () => this._settleBubbleToGrid(bubble, pos, gridWorldPos, gridPos, type),
        },
      ])
    );
  }

  private _settleBubbleToGrid(
    bubble: Entity,
    pos: PositionComponent,
    gridWorldPos: { x: number; y: number },
    gridPos: { col: number; row: number },
    type: BubbleType
  ) {
    const tween = bubble.getComponent(TweenComponent)!;

    tween.addTween({
      mode: "to",
      target: pos,
      to: gridWorldPos,
      duration: 0.3,
      onComplete: async () => {
        bubble.addComponent(new GridPositionComponent(gridPos.row, gridPos.col));
        await this._handleConnectedBubbles(gridPos, bubble, type);
        this._eventBus.emit<BubblePopAfterEvent>(Events.BUBBLE_POP_AFTER, { missed: false });
      },
    });
  }

  private async _handleConnectedBubbles(
    gridPos: { col: number; row: number },
    bubble: Entity,
    type: BubbleType
  ) {
    const connected = this._gridService.findConnectedNeighbours(gridPos.col, gridPos.row, type);

    if (connected.length < 3) {
      return;
    }

    // Put the moving bubble at the begining of the array
    const movingBubbleIndex = connected.findIndex((element) => element === bubble);
    connected.splice(movingBubbleIndex, 1);
    connected.unshift(bubble);

    for (let i = 0; i < connected.length; i++) {
      await this._popBubbleTween(connected[i]);
    }

    this._removeFloatingBubbles();
  }

  private async _popBubbleTween(entity: Entity): Promise<void> {
    const sprite = entity.getComponent(SpriteComponent)!;

    return new Promise((resolve) => {
      entity.addComponent(
        new TweenComponent([
          {
            mode: "fromTo",
            target: sprite,
            duration: 0.2,
            from: { scaleX: 1, scaleY: 1 },
            to: { scaleX: 0, scaleY: 0 },
            onComplete: () => {
              this._entityManager.remove(entity);

              this._sound.play(`pop${getRandomInt(1, 11)}`);

              resolve();
            },
          },
        ])
      );
    });
  }

  private _removeFloatingBubbles() {
    const unconnected = this._gridService.findUnConnectedNeighbours();
    for (const bubble of unconnected) {
      const pos = bubble.getComponent(PositionComponent)!;
      ExplosionFactory.createExplosion(this._entityManager, this._gridService.getGridContainer(), [
        pos.x,
        pos.y,
      ]);
      this._entityManager.remove(bubble);
    }
  }

  private _pushNeighbours(movingBubble: Entity, gridPos: { col: number; row: number }) {
    const neighbours = this._gridService.findNeighboursRadius(gridPos.col, gridPos.row, 4);
    const collisionPos = movingBubble.getComponent(PositionComponent)!;

    neighbours.forEach((neighbour, index) => {
      const pos = neighbour.getComponent(PositionComponent)!;
      const dx = pos.x - collisionPos.x;
      const dy = pos.y - collisionPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        const push = 20 - index;
        const nx = (dx / dist) * push;
        const ny = (dy / dist) * push;

        neighbour.addComponent(
          new TweenComponent([
            {
              id: "collided",
              mode: "to",
              target: pos,
              to: {
                x: pos.x + nx,
                y: pos.y + ny,
                yoyo: true,
                repeat: 1,
              },
              duration: 0.15,
            },
          ])
        );
      }
    });
  }

  private _getPositionInGrid(movingBubble: Entity): { col: number; row: number } | null {
    const position = movingBubble.getComponent(PositionComponent)!;
    let { col, row } = this._gridService.worldToGrid(position.x, position.y);

    if (this._gridService.isOccupied(row, col)) {
      const nearest = this._gridService.findNearestUnOccupied(col, row);
      if (nearest) ({ col, row } = nearest);
    }

    return { col, row };
  }
}
