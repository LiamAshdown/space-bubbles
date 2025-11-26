import type { Graphics } from "pixi.js";
import type { ComponentInterface } from "../../engine/ecs/types";

export class GraphicsComponent implements ComponentInterface {
  public gfx: Graphics;

  constructor(gfx: Graphics) {
    this.gfx = gfx;
  }

  delete?(): void;
}
