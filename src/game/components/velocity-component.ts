import type { ComponentInterface } from "../../engine/ecs/types";

export class VelocityComponent implements ComponentInterface {
  public vx: number;
  public vy: number;

  constructor(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
  }

  delete?(): void;
}
