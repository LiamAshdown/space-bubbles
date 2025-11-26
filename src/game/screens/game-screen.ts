import { Container, Graphics, Sprite, Ticker } from "pixi.js";
import { AbstractAppScreen, Navigation } from "../../engine/navigation/navigation";
import { createSprite } from "../utils/sprite";
import { Game } from "../game";
import { GameOverOverlay } from "../overlays/game-over-overlay";
import { YouWinOverlay } from "../overlays/you-win-overlay";
import { MenuScreen } from "./menu-screen";
import type { Sound } from "../../engine/sound/sound";
import { MenuButton } from "../ui/menu-button";
import { PauseOverlay } from "../overlays/pause-overlay";

export interface GameScreenParams {
  level: number;
}

export class GameScreen extends AbstractAppScreen {
  static SCREEN_ID = "game-screen";
  static ASSET_BUNDLES: string[] = ["game", "sounds"];

  private readonly _background: Sprite;
  private readonly _pauseButton: MenuButton;
  private readonly _swapButton: MenuButton;
  private _gridContainer: Container = new Container();
  private readonly _gameContainer: Container = new Container();
  private readonly _gameContainerBackground: Sprite;
  private readonly _loading: Sprite;
  private readonly _gameMask: Graphics = new Graphics();

  private _game!: Game;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._background = createSprite("bg_simple");
    this.addChild(this._background);

    this._gameContainerBackground = createSprite("bg_game");
    this._gameContainer.addChild(this._gameContainerBackground);

    this._loading = createSprite("loading");
    this._loading.pivot.set(this._loading.width / 2, this._loading.height / 2);
    this._gameContainer.addChild(this._loading);

    this._pauseButton = new MenuButton("btn_pause");
    this._gameContainer.addChild(this._pauseButton);

    this._swapButton = new MenuButton("btn_swap");
    this._swapButton.zIndex = 99;
    this._gameContainer.addChild(this._swapButton);

    this._swapButton.onPress.connect(() => {
      if (this._game) {
        this.sound.play("swap");
        this._game.swap();
      }
    });

    this._gameContainer.addChild(this._gameMask);
    this._gameContainer.mask = this._gameMask;

    this.addChild(this._gameContainer);
  }

  init(params?: GameScreenParams): void {
    this._gameContainer.removeChild(this._gridContainer);
    this._gridContainer = new Container();
    const level = params?.level || 1;

    this._game = new Game(this._gridContainer, level, this.sound);

    this._pauseButton.onPress.connect(() => {
      this.sound.play("click");
      this.navigation.showOverlay(PauseOverlay, {
        textHeader: "txt_youwin",
        onHome: () => {
          this.navigation.hideOverlay();
          this.navigation.navigate(MenuScreen);
        },
        onRestart: () => {
          this.navigation.hideOverlay();
          this._game.start();
        },
      });
    });

    this._game.onGameOver(() => {
      this.navigation.showOverlay(GameOverOverlay, {
        textHeader: "txt_youlose",
        score: 100,
        hideClose: true,
        onRestart: () => {
          this.navigation.hideOverlay();
          this._game.start();
        },
      });
    });

    this._game.onGameYouWin(() => {
      this.navigation.showOverlay(YouWinOverlay, {
        textHeader: "txt_youwin",
        onHome: () => {
          this.navigation.hideOverlay();
          this.navigation.navigate(MenuScreen);
        },
      });
    });

    this._game.onGameLoading(() => {
      this._gameContainer.addChild(this._loading);
    });

    this._game.onGameStart(() => {
      this._gameContainer.removeChild(this._loading);
    });

    this._game.start();

    this._gameContainer.addChild(this._gridContainer);
  }

  update(ticker: Ticker) {
    this._game.update(ticker);

    this._loading.rotation += (Math.PI * 2 * ticker.deltaMS) / 2_000;
  }

  resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._background.width = screenWidth;
    this._background.height = screenHeight;

    this.scaleContainerToLogicalSize(
      this._gameContainer,
      logicalWidth,
      logicalHeight,
      screenWidth,
      screenHeight
    );

    this._gameContainerBackground.width = logicalWidth;
    this._gameContainerBackground.height = logicalHeight;

    this._loading.position.x = logicalWidth / 2;
    this._loading.position.y = logicalHeight / 2;

    this._pauseButton.position.x = logicalWidth - 100;
    this._pauseButton.position.y = logicalHeight - 80;

    this._swapButton.position.x = 100;
    this._swapButton.position.y = logicalHeight - 80;

    this._gameMask.clear().rect(0, 0, logicalWidth, logicalHeight).fill({ color: 0xffffff });

    this._game.resize(logicalWidth, logicalHeight, screenWidth, screenHeight);
  }
}
