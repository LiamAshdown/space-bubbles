import { Texture, Sprite, AnimatedSprite, Assets } from "pixi.js";

export const createSprite = (textureId: string, anchor: number = 0): Sprite => {
  const sprite = new Sprite(Texture.from(`${textureId}.png`));
  sprite.anchor.set(anchor);
  return sprite;
};

export const createTexture = (textureId: string): Texture => {
  return Texture.from(`${textureId}.png`);
};

export const createSpritesheet = (textureId: string, animationKey: string): AnimatedSprite => {
  const texture = Assets.get(textureId);

  if (!texture) {
    throw new Error(`Could not find ${textureId}`);
  }

  return new AnimatedSprite(texture.animations[animationKey]);
};
