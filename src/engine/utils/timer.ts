export class Timer {
  private _interval: number;
  private _elapsed: number = 0;

  constructor(interval: number) {
    this._interval = interval;
  }

  update(deltaTime: number) {
    this._elapsed += deltaTime;
  }

  passed(): boolean {
    if (this._elapsed >= this._interval) {
      this._elapsed = 0;
      return true;
    }

    return false;
  }
}
