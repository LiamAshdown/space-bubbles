import type { Container } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import { createSpritesheet } from "../utils/sprite";
import { SpriteComponent } from "../components/sprite-component";
import { PositionComponent } from "../components/position-component";

export class ExplosionFactory {
  static createExplosion(
    entityManager: EntityManager,
    container: Container,
    position: Record<number, number>
  ) {
    const animationSprite = createSpritesheet("game-explosion", "explosion");

    const explosion = entityManager.create();
    explosion.addComponent(new SpriteComponent(animationSprite));
    explosion.addComponent(new PositionComponent(position[0], position[1]));

    animationSprite.loop = false;
    animationSprite.anchor = 0.5;
    animationSprite.animationSpeed = 0.3;
    animationSprite.onComplete = () => {
      entityManager.remove(explosion);
    };

    container.addChild(animationSprite);

    animationSprite.play();
  }
}
