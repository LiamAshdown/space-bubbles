import type { GridService } from "./grid-service";
import { StorageService } from "./storage-service";

export class LevelService {
  static LEVEL_STATES = {
    NOT_COMPLETED: 0,
    COMPLETED: 1,
    LOCKED: 2,
  };

  private _gridService: GridService;
  private _storageService: StorageService;
  private _level!: number;
  private _levelsCompleted!: Record<number, number>;
  private _levels: number;
  private _shots: number;
  private _rows: number;
  private _rowCount: number;

  constructor(gridService: GridService, storageService: StorageService = new StorageService()) {
    this._gridService = gridService;
    this._storageService = storageService;

    this._shots = 0;

    this._rowCount = 0;
    this._rows = 5;

    this._levels = 70;

    this.sync();
  }

  async start(level: number) {
    this._shots = 0;
    this._rowCount = 0;
    this._rows = 5;
    this._level = level;

    await this._gridService.createGrid(this._level, this._rows);
  }

  sync() {
    this._level = this._storageService.get<number>("current-level", 1)!;
    this._levelsCompleted = this._storageService.get<Record<number, number>>("levels-completed", {
      1: 0,
    })!;
  }

  getLevels() {
    const levelsCompleted: Record<number, number> = {};
    for (let i = 1; i < this._levels; i++) {
      if (i in this._levelsCompleted) {
        levelsCompleted[i] = this._levelsCompleted[i];
      } else {
        if (this._level === i) {
          levelsCompleted[i] = LevelService.LEVEL_STATES.NOT_COMPLETED;
        } else {
          levelsCompleted[i] = LevelService.LEVEL_STATES.LOCKED;
        }
      }
    }

    return levelsCompleted;
  }

  incrementShot(): number {
    return this._shots++;
  }

  canAddRow(): boolean {
    if (this._rowCount >= this._rows) {
      return false;
    }

    return this._shots % 5 === 0 && this._shots < 25;
  }

  canPushRowsDown(): boolean {
    return this._shots % 5 === 0 && this._shots > 25;
  }

  complete() {
    this._levelsCompleted[this._level] = LevelService.LEVEL_STATES.COMPLETED;
    this._level++;

    if (this._level > this._levels) {
      this._level = this._levels;
    } else {
      this._levelsCompleted[this._level] = LevelService.LEVEL_STATES.NOT_COMPLETED;
    }

    this._storageService.set("current-level", this._level);
    this._storageService.set("levels-completed", this._levelsCompleted);
  }

  async addRow(): Promise<void> {
    await this._gridService.addRowToGrid();

    this._rowCount++;
  }

  async pushRowsDown(): Promise<void> {
    await this._gridService.pushRowsDown();
  }
}
