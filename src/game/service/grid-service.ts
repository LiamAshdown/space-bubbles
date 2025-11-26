import type { Container } from "pixi.js";
import type { EntityManager } from "../../engine/ecs/entity-manager";
import type { Entity } from "../../engine/ecs/types";
import { BubbleComponent } from "../components/bubble-component";
import { GridPositionComponent } from "../components/grid-position-component";
import { GRID_CONFIG } from "../config/grid-config";
import { BubbleGridFactory } from "../factories/bubble-grid-factory";
import type { BubbleType } from "../utils/enum";
import { TopbarComponent } from "../components/topbar-component";

export class GridService {
  private readonly _entityManager: EntityManager;
  private readonly _container: Container;

  constructor(entityManager: EntityManager, container: Container) {
    this._entityManager = entityManager;
    this._container = container;
  }

  getEntityManager(): EntityManager {
    return this._entityManager;
  }

  getGridContainer(): Container {
    return this._container;
  }

  async createGrid(level: number, rows: number) {
    const entities = [
      ...this._entityManager.queryEntities([GridPositionComponent]),
      ...this._entityManager.queryEntities([TopbarComponent]),
    ];

    for (const entity of entities) {
      this._entityManager.remove(entity);
    }

    await BubbleGridFactory.createBubbleGrid(level, this);
    BubbleGridFactory.createTopBar(this._entityManager, this._container, rows);
  }

  async addRowToGrid() {
    await BubbleGridFactory.addRowToGrid(this);
  }

  async pushRowsDown() {
    await BubbleGridFactory.pushRowsDown(this);
  }

  gridToWorld(row: number, col: number): { x: number; y: number } {
    let x = col * GRID_CONFIG.COLUMN_SPACING + GRID_CONFIG.COLUMN_PADDING;

    const isOddRow = row % 2 !== 0;
    if (isOddRow) {
      x += GRID_CONFIG.X_ROW_OFFSET;
    }

    const y = row * GRID_CONFIG.ROW_SPACING + GRID_CONFIG.ROW_PADDING;

    return { x, y };
  }

  worldToGrid(x: number, y: number): { row: number; col: number } {
    const row = Math.round((y - GRID_CONFIG.ROW_PADDING) / GRID_CONFIG.ROW_SPACING);

    const isOddRow = row % 2 !== 0;
    let adjustedX = x;
    if (isOddRow) {
      adjustedX -= GRID_CONFIG.X_ROW_OFFSET;
    }

    const col = Math.round((adjustedX - GRID_CONFIG.COLUMN_PADDING) / GRID_CONFIG.COLUMN_SPACING);

    return { row, col };
  }

  isOccupied(row: number, col: number): boolean {
    const grid = this.getGridEntities();
    return !!grid?.[col]?.[row];
  }

  findNearestUnOccupied(col: number, row: number): { col: number; row: number } | null {
    const grid = this.getGridEntities();
    const getBubbleAt = (col: number, row: number) => grid?.[col]?.[row];

    const neighbors = this._getHexNeighbors(col, row);
    const stack: [number, number][] = [...neighbors];

    while (stack.length) {
      const [neighborCol, neighborRow] = stack.pop()!;

      const bubble = getBubbleAt(neighborCol, neighborRow);
      if (!bubble) {
        return { col: neighborCol, row: neighborRow };
      }
    }

    return null;
  }

  getBottomOfGridPosition(): Entity[] {
    const bubbles = this._entityManager.queryEntities([GridPositionComponent]);
    let bottomRow = 0;
    let bottomBubbles: Entity[] = [];

    for (const bubble of bubbles) {
      const gridComponent = bubble.getComponent(GridPositionComponent)!;

      if (gridComponent.row > bottomRow) {
        bottomRow = gridComponent.row;
        bottomBubbles = [];
      }

      if (gridComponent.row === bottomRow) {
        bottomBubbles.push(bubble);
      }
    }

    return bottomBubbles;
  }

  getRowsLeft(): number {
    const grid = this.getGridEntities();
    const uniqueRows = new Set<string>();

    for (const [, rows] of Object.entries(grid)) {
      for (const [row] of Object.entries(rows)) {
        uniqueRows.add(row);
      }
    }

    return uniqueRows.size;
  }

  getTopFirstBubble(): Entity | null {
    const grid = this.getGridEntities();
    let topRow = Infinity;
    let topBubble: Entity | null = null;

    for (const [, rows] of Object.entries(grid)) {
      for (const [rowStr, entity] of Object.entries(rows)) {
        const row = parseInt(rowStr);
        if (row < topRow) {
          topRow = row;
          topBubble = entity;
        }
      }
    }

    return topBubble;
  }

  getBubbles(): Entity[] {
    return this._entityManager.queryEntities([GridPositionComponent]);
  }

  findNeighboursRadius(col: number, row: number, radius = 1): Entity[] {
    const bubbles = this._entityManager.queryEntities([GridPositionComponent]);
    const neighbours: { distance: number; entity: Entity }[] = [];

    for (const bubble of bubbles) {
      const gridPosition = bubble.getComponent(GridPositionComponent)!;
      const dx = gridPosition.col - col;
      const dy = gridPosition.row - row;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance <= radius) {
        neighbours.push({ distance, entity: bubble });
      }
    }

    return neighbours.sort((a, b) => a.distance - b.distance).map((item) => item.entity);
  }

  findConnectedNeighbours(col: number, row: number, bubbleType: BubbleType): Entity[] {
    const grid = this.getGridEntities();
    const visited = new Set<string>();
    const connected: Entity[] = [];

    const makeKey = (col: number, row: number) => `${col},${row}`;
    const getBubbleAt = (col: number, row: number) => grid?.[col]?.[row];

    const stack: [number, number][] = this._getHexNeighbors(col, row);

    while (stack.length) {
      const [currentCol, currentRow] = stack.pop()!;
      const gridKey = makeKey(currentCol, currentRow);

      if (visited.has(gridKey)) {
        continue;
      }

      visited.add(gridKey);

      const bubble = getBubbleAt(currentCol, currentRow);
      if (!bubble) {
        continue;
      }

      const bubbleComponent = bubble.getComponent(BubbleComponent);
      if (!bubbleComponent || bubbleComponent.type !== bubbleType) {
        continue;
      }

      connected.push(bubble);

      const neighbors = this._getHexNeighbors(currentCol, currentRow);
      for (const [neighborCol, neighborRow] of neighbors) {
        stack.push([neighborCol, neighborRow]);
      }
    }

    return connected;
  }

  findUnConnectedNeighbours(): Entity[] {
    const grid = this.getGridEntities();

    const topRow = this._findTopRow(grid);
    if (topRow === Infinity) {
      return [];
    }

    const getBubbleAt = (col: number, row: number) => grid[col]?.[row];
    const makeKey = (col: number, row: number) => `${col},${row}`;

    const visited = new Set<string>();
    const connectedToTop = new Set<string>();
    const stack: [number, number][] = [];

    // Start with all bubbles in the top row (anchored to ceiling)
    for (const [colStr, rows] of Object.entries(grid)) {
      const col = parseInt(colStr);
      for (const [rowStr] of Object.entries(rows)) {
        const row = parseInt(rowStr);
        if (row === topRow) {
          stack.push([col, row]);
          connectedToTop.add(makeKey(col, row));
        }
      }
    }

    // Depth-first search to find all connected bubbles
    while (stack.length > 0) {
      const [col, row] = stack.pop()!;
      const gridKey = makeKey(col, row);

      if (visited.has(gridKey)) {
        continue;
      }
      visited.add(gridKey);

      const neighbors = this._getHexNeighbors(col, row);
      for (const [neighborCol, neighborRow] of neighbors) {
        if (getBubbleAt(neighborCol, neighborRow)) {
          const neighborKey = makeKey(neighborCol, neighborRow);
          if (!connectedToTop.has(neighborKey)) {
            connectedToTop.add(neighborKey);
            stack.push([neighborCol, neighborRow]);
          }
        }
      }
    }

    // Collect bubbles not connected to the top
    const unconnected: Entity[] = [];
    for (const [colStr, rows] of Object.entries(grid)) {
      const col = parseInt(colStr);
      for (const [rowStr, entity] of Object.entries(rows)) {
        const row = parseInt(rowStr);
        if (!connectedToTop.has(makeKey(col, row))) {
          unconnected.push(entity);
        }
      }
    }

    return unconnected;
  }

  private _findTopRow(grid: Record<number, Record<number, Entity>>): number {
    let topRow = Infinity;

    for (const [, rows] of Object.entries(grid)) {
      for (const rowStr of Object.keys(rows)) {
        const row = parseInt(rowStr);
        if (row < topRow) {
          topRow = row;
        }
      }
    }

    return topRow;
  }

  private _getHexNeighbors(col: number, row: number): [number, number][] {
    const isOddRow = row % 2 !== 0;

    if (isOddRow) {
      return [
        [col - 1, row],
        [col + 1, row],
        [col, row - 1],
        [col + 1, row - 1],
        [col, row + 1],
        [col + 1, row + 1],
      ];
    } else {
      return [
        [col - 1, row],
        [col + 1, row],
        [col - 1, row - 1],
        [col, row - 1],
        [col - 1, row + 1],
        [col, row + 1],
      ];
    }
  }

  public getGridEntities(): Record<number, Record<number, Entity>> {
    const bubbles = this._entityManager.queryEntities([GridPositionComponent]);
    const gridLookup: Record<number, Record<number, Entity>> = {};

    for (const bubble of bubbles) {
      const gridPosition = bubble.getComponent(GridPositionComponent)!;

      if (!gridLookup[gridPosition.col]) {
        gridLookup[gridPosition.col] = {};
      }
      gridLookup[gridPosition.col][gridPosition.row] = bubble;
    }

    return gridLookup;
  }
}
