import { BubbleFactory } from "./bubble-factory";
import { PositionComponent } from "../components/position-component";
import { GridPositionComponent } from "../components/grid-position-component";
import { getRandomBubbleType, tweenToAsync } from "../utils/helpers";
import { BubbleType } from "../utils/enum";
import type { GridService } from "../service/grid-service";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import { TopbarComponent } from "../components/topbar-component";
import { SpriteComponent } from "../components/sprite-component";
import { createSprite } from "../utils/sprite";
import type { Container } from "pixi.js";

type TemplateData = Array<[number, number][]>;

const loadTemplate = async (level: number): Promise<TemplateData | null> => {
  try {
    const response = await fetch(`levels/level-${level}.json`);

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to fetch level template data");
    }
  } catch (error: unknown) {
    console.log(error);
    return null;
  }
};

export class BubbleGridFactory {
  static async pushRowsDown(gridService: GridService) {
    const entityManager = gridService.getEntityManager();

    const bubbles = entityManager.queryEntities([GridPositionComponent]);

    const promises = [];

    for (const bubble of bubbles) {
      const gridPosition = bubble.getComponent(GridPositionComponent)!;
      gridPosition.row += 1;

      promises.push(
        tweenToAsync(
          bubble,
          bubble.getComponent(PositionComponent)!,
          gridService.gridToWorld(gridPosition.row, gridPosition.col)
        )
      );
    }

    const topbar = entityManager.queryEntity([TopbarComponent]);

    if (!topbar) {
      return Promise.all(promises);
    }

    const topbarPositionComponent = topbar.getComponent(PositionComponent)!;

    promises.push(
      tweenToAsync(topbar, topbarPositionComponent, {
        x: topbarPositionComponent.x,
        y: topbarPositionComponent.y + 52,
      })
    );

    return Promise.all(promises);
  }

  static async addRowToGrid(gridService: GridService) {
    const newRow = 0;
    for (let col = 0; col < 11; col++) {
      const bubble = BubbleFactory.createBubble(gridService, getRandomBubbleType(), [newRow, col]);

      const gridComponent = bubble.getComponent(GridPositionComponent)!;
      const positionComponent = bubble.getComponent(PositionComponent)!;

      gridComponent.row = -1;
      positionComponent.y = -100;
    }

    return this.pushRowsDown(gridService);
  }

  static async createBubbleGrid(level: number, gridService: GridService) {
    const template = await loadTemplate(level);

    if (template === null) {
      return;
    }

    const maxRow = Math.min(8, template.length);

    for (let row = 0; row < maxRow; row++) {
      for (let col = 0; col < template[row].length; col++) {
        const bubbleData = template[row][col];

        if (!bubbleData[0]) {
          continue;
        }

        const hasBubble = bubbleData[1] !== -1;
        if (hasBubble) {
          BubbleFactory.createBubble(gridService, bubbleData[1] as BubbleType, [row, col]);
        }
      }
    }
  }

  static createTopBar(entityManager: EntityManager, container: Container, rows: number) {
    const line = entityManager.create();

    const sprite = createSprite("top_line");

    line.addComponent(new TopbarComponent());
    line.addComponent(new SpriteComponent(sprite));
    line.addComponent(new PositionComponent(0, -(rows * 55)));

    container.addChild(sprite);
  }
}
