import type { ComponentInterface, EntityId } from "../../engine/ecs/types";

export class ParentComponent implements ComponentInterface {
  public parentId: EntityId;
  public offsetX: number;
  public offsetY: number;
  public lerpSpeed: number; // Speed of interpolation (0-1, where 1 = instant)

  constructor(
    parentId: EntityId,
    offsetX: number = 0,
    offsetY: number = 0,
    lerpSpeed: number = 0.1
  ) {
    this.parentId = parentId;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.lerpSpeed = lerpSpeed;
  }

  delete?(): void;
}
