export class StorageService {
  private storage: Storage;

  constructor(storage: Storage = window.localStorage) {
    this.storage = storage;
  }

  set<T>(key: string, value: T): void {
    try {
      const data = JSON.stringify(value);
      this.storage.setItem(key, data);
    } catch (err) {
      console.error(`StorageService.set: Failed to store "${key}"`, err);
    }
  }

  get<T>(key: string, defaultValue: T | null = null): T | null {
    const raw = this.storage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }

    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`StorageService.get: Failed to parse "${key}"`, err);
      return defaultValue;
    }
  }

  remove(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }
}
