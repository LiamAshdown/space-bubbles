import { Container, Ticker } from "pixi.js";
import type { AssetLoader } from "../assets/asset-loader";
import { EventBus } from "../utils/eventBus";
import type { Sound } from "../sound/sound";

export interface AppScreenInterface<T = unknown> extends Container {
  init?: (params?: T) => void;
  show?: () => Promise<void>;
  hide?: () => Promise<void>;
  update?: (time: Ticker) => void;
  resize?: (
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ) => void;
}

export abstract class AbstractAppScreen<T = unknown>
  extends Container
  implements AppScreenInterface<T>
{
  protected readonly navigation: Navigation;
  protected readonly sound: Sound;

  constructor(navigation: Navigation, sound: Sound) {
    super();
    this.navigation = navigation;
    this.sound = sound;
  }

  protected scaleContainerToLogicalSize(
    container: Container,
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ) {
    const gameRatio = logicalWidth / logicalHeight;
    const screenRatio = screenWidth / screenHeight;

    let scale: number;

    if (screenRatio > gameRatio) {
      scale = screenHeight / logicalHeight;
    } else {
      scale = screenWidth / logicalWidth;
    }

    container.scale.set(scale);

    const scaledWidth = logicalWidth * scale;
    const scaledHeight = logicalHeight * scale;

    container.position.set((screenWidth - scaledWidth) / 2, screenHeight / scaledHeight / 2);

    return scale;
  }
}

export interface LoadScreen extends AppScreenInterface {
  onProgress?: (progress: number) => void;
}

export interface ScreenConstructor<T = unknown> {
  readonly SCREEN_ID: string;
  readonly ASSET_BUNDLES?: string[];
  new (navigation: Navigation, sound: Sound): AppScreenInterface<T>;
}

export const NavigationEvents = {
  NAVIGATE: "navigate",
} as const;

export class Navigation extends EventBus {
  public screenView = new Container();
  public overlayView = new Container();

  private _currentScreen?: AppScreenInterface<unknown>;
  private _currentOverlay?: AppScreenInterface<unknown>;
  private _loadingScreen?: LoadScreen;

  private _screens: Map<string, AppScreenInterface<unknown>> = new Map();
  private _assetLoader: AssetLoader;
  private _sound: Sound;

  private _logicalWidth: number = 0;
  private _logicalHeight: number = 0;
  private _screenWidth: number = 0;
  private _screenHeight: number = 0;

  private currentOverlayResize?: () => void;
  private currentScreenResize?: () => void;

  constructor(assetLoader: AssetLoader, sound: Sound) {
    super();

    this._assetLoader = assetLoader;
    this._sound = sound;
  }

  public setLoadScreen(screenCtor: ScreenConstructor<unknown>) {
    this._loadingScreen = this._getScreen(screenCtor) as LoadScreen;
  }

  public async navigate<T>(screenCtor: ScreenConstructor<T>, params?: T) {
    await this._showScreen(screenCtor, false, params);

    this.emit(NavigationEvents.NAVIGATE, { screenId: screenCtor.SCREEN_ID });
  }

  public async showOverlay<T>(screenCtor: ScreenConstructor<T>, params?: T) {
    await this._showScreen(screenCtor, true, params);

    this.emit(NavigationEvents.NAVIGATE, { screenId: screenCtor.SCREEN_ID });
  }

  public getScreen(): AppScreenInterface<unknown> | undefined {
    return this._currentScreen;
  }

  public getOverlay(): AppScreenInterface<unknown> | undefined {
    return this._currentOverlay;
  }

  public async hideOverlay() {
    if (!this._currentOverlay) return;
    await this._removeScreen(this._currentOverlay, true);
    this._currentOverlay = undefined;
  }

  public resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ) {
    this._currentScreen?.resize?.(logicalWidth, logicalHeight, screenWidth, screenHeight);
    this._currentOverlay?.resize?.(logicalWidth, logicalHeight, screenWidth, screenHeight);

    this._logicalWidth = logicalWidth;
    this._logicalHeight = logicalHeight;
    this._screenWidth = screenWidth;
    this._screenHeight = screenHeight;
  }

  private _getScreen<T>(screenCtor: ScreenConstructor<T>): AppScreenInterface<T> {
    let screen = this._screens.get(screenCtor.SCREEN_ID) as AppScreenInterface<T>;

    if (!screen) {
      screen = new screenCtor(this, this._sound);
      this._screens.set(screenCtor.SCREEN_ID, screen as AppScreenInterface<unknown>);
    }

    return screen;
  }

  private async _showScreen<T>(screenCtor: ScreenConstructor<T>, isOverlay: boolean, params?: T) {
    const current = isOverlay ? this._currentOverlay : this._currentScreen;
    if (current) {
      await this._removeScreen(current, isOverlay);
    }

    if (screenCtor.ASSET_BUNDLES && !this._assetLoader.areBundlesLoaded(screenCtor.ASSET_BUNDLES)) {
      if (this._loadingScreen) {
        await this._addScreen(this._loadingScreen, isOverlay);
      }

      await this._assetLoader.loadBundles(screenCtor.ASSET_BUNDLES, (progress) => {
        this._loadingScreen?.onProgress?.(progress);
      });

      if (this._loadingScreen) {
        await this._removeScreen(this._loadingScreen, isOverlay);
      }
    }

    const screen = this._getScreen(screenCtor);
    screen.init?.(params);

    if (isOverlay) {
      this._currentOverlay = screen as AppScreenInterface<unknown>;
    } else {
      this._currentScreen = screen as AppScreenInterface<unknown>;
    }

    await this._addScreen(screen as AppScreenInterface<unknown>, isOverlay);
  }

  private async _removeScreen(screen: AppScreenInterface<unknown>, isOverlay = false) {
    if (screen.hide) {
      await screen.hide();
    }

    if (screen.parent) {
      screen.parent.removeChild(screen);
    }

    if (isOverlay && this.currentOverlayResize) {
      window.removeEventListener("resize", this.currentOverlayResize);
    }
    if (!isOverlay && this.currentScreenResize) {
      window.removeEventListener("resize", this.currentScreenResize);
    }
  }

  private async _addScreen(screen: AppScreenInterface<unknown>, isOverlay = false) {
    (isOverlay ? this.overlayView : this.screenView).addChild(screen);

    if (screen.show) {
      await screen.show();
    }

    if (screen.resize) {
      screen.resize(this._logicalWidth, this._logicalHeight, this._screenWidth, this._screenHeight);
    }
  }
}
