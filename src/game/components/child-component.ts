import type { ComponentInterface } from "../../engine/ecs/types";

export class ChildComponent implements ComponentInterface {
  public childId: number;

  constructor(childId: number) {
    this.childId = childId;
  }

  delete?(): void;
}
