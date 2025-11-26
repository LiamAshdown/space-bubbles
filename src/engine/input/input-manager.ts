import type { Container, FederatedPointerEvent } from "pixi.js";
import { EventBus } from "../utils/eventBus";

export const InputEvents = {
  KEY_DOWN: "keyDown",
  KEY_UP: "keyUp",
  MOUSE_DOWN: "mouseDown",
  MOUSE_UP: "mouseUp",
  MOUSE_MOVE: "mouseMove",
} as const;

export class InputManager extends EventBus {
  private _keys: Set<string> = new Set();
  private _mouseButtons: Set<number> = new Set();
  private _mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  private _container: Container;

  constructor(container: Container) {
    super();

    this._container = container;

    this.addListeners();
  }

  public addListeners() {
    // Make sure the event listeners are cleared, before adding new ones
    this.removeListeners();

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    this._container.addEventListener("mousedown", this._onMouseDown);
    this._container.addEventListener("mouseup", this._onMouseUp);
    this._container.addEventListener("mousemove", this._onMouseMove);
  }

  public removeListeners() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    this._container.removeEventListener("mousedown", this._onMouseDown);
    this._container.removeEventListener("mouseup", this._onMouseUp);
    this._container.removeEventListener("mousemove", this._onMouseMove);
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (!this._keys.has(event.code)) {
      this._keys.add(event.code);
      this.emit(InputEvents.KEY_DOWN, event.code);
    }
  };

  private _onKeyUp = (event: KeyboardEvent) => {
    if (this._keys.has(event.code)) {
      this._keys.delete(event.code);
      this.emit(InputEvents.KEY_UP, event.code);
    }
  };

  private _onMouseDown = (event: FederatedPointerEvent) => {
    if (!this._mouseButtons.has(event.button)) {
      this._mouseButtons.add(event.button);
      const pos = this._container.toLocal(event.global);
      this.emit(InputEvents.MOUSE_DOWN, {
        button: event.button,
        x: pos.x,
        y: pos.y,
      });
    }
  };

  private _onMouseUp = (event: FederatedPointerEvent) => {
    if (this._mouseButtons.has(event.button)) {
      this._mouseButtons.delete(event.button);
      const pos = this._container.toLocal(event.global);
      this.emit(InputEvents.MOUSE_UP, {
        button: event.button,
        x: pos.x,
        y: pos.y,
      });
    }
  };

  private _onMouseMove = (event: FederatedPointerEvent) => {
    this._mousePosition = this._container.toLocal(event.global);
    this.emit(InputEvents.MOUSE_MOVE, this._mousePosition);
  };

  isKeyPressed(keyCode: string): boolean {
    return this._keys.has(keyCode);
  }

  isMouseButtonPressed(button: number): boolean {
    return this._mouseButtons.has(button);
  }

  getMousePosition(): { x: number; y: number } {
    return this._mousePosition;
  }

  destroy() {
    this.removeListeners();
    super.clear();
  }
}
