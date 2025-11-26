import type { ComponentInterface } from "../../engine/ecs/types";

export class VectorComponent implements ComponentInterface {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: VectorComponent) {
    this.x += v.x;
    this.y += v.y;
  }

  clone(): VectorComponent {
    return new VectorComponent(this.x, this.y);
  }

  distance(vectorComponent: VectorComponent) {
    const x1 = this.x;
    const y1 = this.y;

    const x2 = vectorComponent.x;
    const y2 = vectorComponent.y;

    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    return distance;
  }

  delete?(): void;
}
