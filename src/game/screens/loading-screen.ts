import { Container, Texture, Sprite, NineSliceSprite } from "pixi.js";
import type { LoadScreen } from "../../engine/navigation/navigation";
import { ProgressBar } from "@pixi/ui";
import { createSprite, createTexture } from "../utils/sprite";
import { fitContainerToScreen } from "../utils/helpers";

export class LoadingScreen extends Container implements LoadScreen {
  static SCREEN_ID = "loading-screen";
  static ASSET_BUNDLES: string[] = ["preload"];

  private readonly _background: Sprite;
  private readonly _gameContainer: Container = new Container();
  private readonly _gameContainerBackground: Sprite;
  private readonly _gameTitle: Sprite;
  private readonly _progress: ProgressBar;

  constructor() {
    super();

    this._background = createSprite("bg_simple");
    this.addChild(this._background);

    this._gameContainerBackground = createSprite("bg_menu");
    this._gameContainer.addChild(this._gameContainerBackground);

    this._gameTitle = createSprite("game_title", 0.5);
    this._gameContainer.addChild(this._gameTitle);

    this._progress = this.createProgressBar();
    this._gameContainer.addChild(this._progress);

    this.addChild(this._gameContainer);
  }

  resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._background.width = screenWidth;
    this._background.height = screenHeight;

    fitContainerToScreen(this._gameContainer, screenWidth, screenHeight);

    this._gameContainerBackground.width = logicalWidth;
    this._gameContainerBackground.height = logicalHeight;

    this._gameTitle.position.set(logicalWidth / 2, logicalHeight * 0.25);
    this._progress.position.set((logicalWidth - this._progress.width) / 2, logicalHeight * 0.5);
  }

  onProgress(progress: number) {
    console.log(progress);
    this._progress.progress = progress;
  }

  private createProgressBar(): ProgressBar {
    return new ProgressBar({
      bg: "load_bar.png",
      fill: new NineSliceSprite({
        texture: createTexture("load_progress"),
        leftWidth: 5,
        rightWidth: 5,
        topHeight: 5,
        bottomHeight: 5,
        width: 450,
        height: 25,
      }),
      progress: 0,
      fillPaddings: {
        top: 5,
        right: 0,
        left: 4,
        bottom: 5,
      },
    });
  }
}
