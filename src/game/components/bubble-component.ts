import type { ComponentInterface } from "../../engine/ecs/types";
import type { BubbleType } from "../utils/enum";

export class BubbleComponent implements ComponentInterface {
  public type: BubbleType;
  public radius: number;

  constructor(type: BubbleType, radius: number = 55) {
    this.type = type;
    this.radius = radius;
  }

  delete?(): void;
}
