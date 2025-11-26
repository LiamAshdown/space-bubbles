import type { ComponentInterface } from "../../engine/ecs/types";

export class GridPositionComponent implements ComponentInterface {
  public row: number;
  public col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }

  delete?(): void;
}
