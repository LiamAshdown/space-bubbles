import { Graphics } from "pixi.js";
import type { Entity } from "../../engine/ecs/types";
import { createSprite } from "../utils/sprite";
import { SpriteComponent } from "../components/sprite-component";
import { PositionComponent } from "../components/position-component";
import { CannonComponent } from "../components/cannon-component";
import { BubbleType } from "../utils/enum";
import { BubbleFactory } from "./bubble-factory";
import { ParentComponent } from "../components/parent-component";
import { GraphicsComponent } from "../components/graphics-component";
import { ChildComponent } from "../components/child-component";
import { PreShooterComponent } from "../components/preshooter-component";
import { CannonReloadComponent } from "../components/cannon-reload-component";
import type { GridService } from "../service/grid-service";
import { GridPositionComponent } from "../components/grid-position-component";

export class CannonFactory {
  static createCannon(gridService: GridService): Entity {
    const cannon = gridService.getEntityManager().create();

    const sprite = createSprite("shooter", 0.5);

    cannon.addComponent(new SpriteComponent(sprite));
    cannon.addComponent(new PositionComponent(0, 0));
    cannon.addComponent(new CannonComponent());
    cannon.addComponent(new CannonReloadComponent());

    const bubble = BubbleFactory.createBubble(gridService, BubbleType.RED, [cannon.getId(), 0]);
    bubble.addComponent(new ParentComponent(cannon.getId(), 0, -100));
    bubble.removeComponent(GridPositionComponent);

    cannon.addComponent(new ChildComponent(bubble.getId()));

    const guideline = gridService.getEntityManager().create();
    const lineGfx = new Graphics();
    guideline.addComponent(new GraphicsComponent(lineGfx));
    guideline.addComponent(new ParentComponent(cannon.getId()));

    const gridContainer = gridService.getGridContainer();

    gridContainer.addChild(lineGfx);
    gridContainer.addChild(sprite);
    return cannon;
  }

  static createPreShooter(gridService: GridService): Entity {
    const preShooter = gridService.getEntityManager().create();

    const sprite = createSprite("preshooter", 0.5);
    preShooter.addComponent(new SpriteComponent(sprite));
    preShooter.addComponent(new PositionComponent(0, 0));
    preShooter.addComponent(new PreShooterComponent());

    const bubble = BubbleFactory.createBubble(gridService, BubbleType.RED, [preShooter.getId(), 0]);
    bubble.addComponent(new ParentComponent(preShooter.getId(), 0, -100));
    bubble.removeComponent(GridPositionComponent);

    preShooter.addComponent(new ChildComponent(bubble.getId()));

    gridService.getGridContainer().addChild(sprite);
    return preShooter;
  }
}
