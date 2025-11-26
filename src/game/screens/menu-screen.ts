import { Container, Sprite, Ticker, TilingSprite } from "pixi.js";
import { FancyButton } from "@pixi/ui";
import { AbstractAppScreen, Navigation } from "../../engine/navigation/navigation";
import { MenuButton } from "../ui/menu-button";
import { createSprite, createTexture } from "../utils/sprite";
import { AboutOverlay } from "../overlays/about-overlay";
import { fitContainerToScreen } from "../utils/helpers";
import { LevelScreen } from "./level-screen";
import { Sound } from "../../engine/sound/sound";

export class MenuScreen extends AbstractAppScreen {
  static SCREEN_ID = "menu-screen";
  static ASSET_BUNDLES: string[] = ["preload", "game"];

  private readonly _background: TilingSprite;
  private readonly _gameContainer: Container = new Container();
  private readonly _gameContainerBackground: Sprite;
  private readonly _gameTitle: Sprite;
  private readonly _playButton: FancyButton;
  private readonly _soundEffectsButton: MenuButton;
  private readonly _musicButton: MenuButton;
  private readonly _infoButton: MenuButton;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._background = new TilingSprite(createTexture("bg_simple"));
    this.addChild(this._background);

    this._gameContainerBackground = createSprite("bg_menu");
    this._gameContainer.addChild(this._gameContainerBackground);

    this._gameTitle = createSprite("game_title", 0.5);
    this._gameContainer.addChild(this._gameTitle);

    this._playButton = this.createFancyButton("btn_play");
    this._playButton.onPress.connect(() => {
      this.sound.play("click");
      this.navigation.navigate(LevelScreen);
    });
    this._gameContainer.addChild(this._playButton);

    this._soundEffectsButton = new MenuButton("btn_sound", "btn_sound_off");
    this._musicButton = new MenuButton("btn_music", "btn_music_off");

    if (this.sound.isEffectsEnabled()) {
      this._soundEffectsButton.enable();
    } else {
      this._soundEffectsButton.disable();
    }

    if (this.sound.isMusicEnabled()) {
      this._musicButton.enable();
    } else {
      this._musicButton.disable();
    }

    this._soundEffectsButton.onPress.connect(() => {
      this.sound.toggleEffects();
    });

    this._musicButton.onPress.connect(() => {
      this.sound.toggleMusic();
    });
    this._gameContainer.addChild(this._soundEffectsButton);

    this._gameContainer.addChild(this._musicButton);

    this._infoButton = new MenuButton("btn_about");
    this._infoButton.onPress.connect(() => {
      this.sound.play("click");

      this.navigation.showOverlay(AboutOverlay, {
        textHeader: "txt_about",
      });
    });
    this._gameContainer.addChild(this._infoButton);

    this.sound.playMusic("music");

    this.addChild(this._gameContainer);
  }

  update(ticker: Ticker) {
    const scale = 1 + Math.sin(ticker.lastTime / 250) * 0.05;
    this._playButton.scale.set(scale);
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
    this._playButton.position.set(logicalWidth / 2, logicalHeight * 0.5);
    this._soundEffectsButton.position.set(logicalWidth * 0.35, logicalHeight * 0.61);
    this._musicButton.position.set(logicalWidth * 0.5, logicalHeight * 0.61);
    this._infoButton.position.set(logicalWidth * 0.65, logicalHeight * 0.61);
  }

  private createFancyButton(textureId: string): FancyButton {
    const button = new FancyButton({
      defaultView: `${textureId}.png`,
      anchor: 0.5,
      animations: {
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    });
    return button;
  }
}
