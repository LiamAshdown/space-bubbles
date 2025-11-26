import type { Application, Ticker } from "pixi.js";
import { NavigationEvents, type Navigation } from "./navigation/navigation";
import { GAME_RESOLUTION } from "../game/utils/enum";
import type { Sound } from "./sound/sound";

export class Engine {
  private _application: Application;
  private _navigation: Navigation;
  private _sound: Sound;

  constructor(application: Application, navigation: Navigation, sound: Sound) {
    this._application = application;
    this._navigation = navigation;
    this._sound = sound;

    this.init();
  }

  public getNavigation(): Navigation {
    return this._navigation;
  }

  private init() {
    document.body.append(this._application.canvas);
    window.addEventListener("resize", this.resize.bind(this));

    this._navigation.on(NavigationEvents.NAVIGATE, () => {
      this.resize();
    });

    this._application.stage.addChild(this._navigation.screenView, this._navigation.overlayView);

    this.resize();

    this._application.ticker.add(this.update, this);
  }

  update(ticker: Ticker) {
    const screen = this._navigation.getScreen();

    if (screen && screen.update) {
      screen.update(ticker);
    }

    const overlay = this._navigation.getOverlay();

    if (overlay && overlay.update) {
      overlay.update(ticker);
    }
  }

  private resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this._application.renderer.canvas.style.width = `${windowWidth}px`;
    this._application.renderer.canvas.style.height = `${windowHeight}px`;
    this._application.renderer.resize(windowWidth, windowHeight);

    this._navigation.resize(
      GAME_RESOLUTION.WIDTH,
      GAME_RESOLUTION.HEIGHT,
      windowWidth,
      windowHeight
    );
  }
}
