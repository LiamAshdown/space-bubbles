import { BubbleType } from "../utils/enum";
import type { Entity } from "../../engine/ecs/types";
import { createSprite } from "../utils/sprite";
import { SpriteComponent } from "../components/sprite-component";
import { PositionComponent } from "../components/position-component";
import { BubbleComponent } from "../components/bubble-component";
import type { GridService } from "../service/grid-service";
import { GridPositionComponent } from "../components/grid-position-component";

export class BubbleFactory {
  static createBubble(
    gridService: GridService,
    bubbleType: BubbleType,
    grid: Record<number, number> = [0, 0]
  ): Entity {
    const bubble = gridService.getEntityManager().create();

    let bubbleSpriteName = "red-bubble";

    switch (bubbleType) {
      case BubbleType.RED:
        bubbleSpriteName = "red-bubble";
        break;
      case BubbleType.BLUE:
        bubbleSpriteName = "blue-bubble";
        break;
      case BubbleType.GREEN:
        bubbleSpriteName = "green-bubble";
        break;
      case BubbleType.YELLOW:
        bubbleSpriteName = "yellow-bubble";
        break;
      case BubbleType.PURPLE:
        bubbleSpriteName = "purple-bubble";
        break;
      case BubbleType.TEAL:
        bubbleSpriteName = "teal-bubble";
        break;
      case BubbleType.PINK:
        bubbleSpriteName = "pink-bubble";
        break;
    }

    const sprite = createSprite(bubbleSpriteName, 0.5);
    sprite.anchor.set(0.5);

    bubble.addComponent(new SpriteComponent(sprite));
    bubble.addComponent(new BubbleComponent(bubbleType, sprite.width / 2));

    const position = gridService.gridToWorld(grid[0], grid[1]);

    bubble.addComponent(new PositionComponent(position.x, position.y));
    bubble.addComponent(new GridPositionComponent(grid[0], grid[1]));

    gridService.getGridContainer().addChild(sprite);

    return bubble;
  }
}
