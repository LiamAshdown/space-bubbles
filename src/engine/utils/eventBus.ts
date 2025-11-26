type EventHandler<T = unknown> = (payload: T) => void;

export class EventBus {
  private _listeners = new Map<string, Set<EventHandler<unknown>>>();

  on<T = unknown>(event: string, handler: EventHandler<T>) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(handler as EventHandler<unknown>);
  }

  off<T = unknown>(event: string, handler: EventHandler<T>) {
    this._listeners.get(event)?.delete(handler as EventHandler<unknown>);
  }

  emit<T = unknown>(event: string, payload?: T) {
    this._listeners.get(event)?.forEach((h) => (h as EventHandler<T>)(payload!));
  }

  clear(event?: string) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}
