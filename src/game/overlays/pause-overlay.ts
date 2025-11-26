import type { Navigation } from "../../engine/navigation/navigation";
import { OverlayAbstract, type OverlayParams } from "./overlay";
import { MenuButton } from "../ui/menu-button";
import type { Sound } from "../../engine/sound/sound";

export interface YouWinOverlayParams {
  onHome: () => void;
  onRestart: () => void;
}

export class PauseOverlay extends OverlayAbstract {
  static SCREEN_ID = "pause-overlay";

  private readonly _homeButton: MenuButton;
  private readonly _restartButton: MenuButton;

  private readonly _soundEffectsButton: MenuButton;
  private readonly _musicButton: MenuButton;

  private _onHomeCallback?: () => void;
  private _onRestartCallback?: () => void;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._homeButton = new MenuButton("btn_home");
    this._restartButton = new MenuButton("btn_restart");
    this._soundEffectsButton = new MenuButton("btn_sound", "btn_sound_off");
    this._musicButton = new MenuButton("btn_music", "btn_music_off");

    this._homeButton.onPress.connect(() => {
      this.sound.play("click");
      if (this._onHomeCallback) {
        this._onHomeCallback();
      }
    });

    if (
      this._restartButton.onPress.connect(() => {
        this.sound.play("click");
        if (this._onRestartCallback) {
          this._onRestartCallback();
        }
      })
    )
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
      this.sound.play("click");
      this.sound.toggleEffects();
    });

    this._musicButton.onPress.connect(() => {
      this.sound.play("click");
      this.sound.toggleMusic();
    });

    this.addChild(this._homeButton);
    this.addChild(this._restartButton);
    this.addChild(this._soundEffectsButton);
    this.addChild(this._musicButton);
  }

  protected onResize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._homeButton.position.set(
      logicalWidth / 2 + 70,
      logicalHeight / 2 - this._windowBackground.height / 2 + 240
    );

    this._restartButton.position.set(
      logicalWidth / 2 - 70,
      logicalHeight / 2 - this._windowBackground.height / 2 + 240
    );

    this._soundEffectsButton.position.set(
      logicalWidth / 2 - 60,
      logicalHeight / 2 - this._windowBackground.height / 2 + 360
    );

    this._musicButton.position.set(
      logicalWidth / 2 + 60,
      logicalHeight / 2 - this._windowBackground.height / 2 + 360
    );
  }

  protected onInit(params?: (OverlayParams & YouWinOverlayParams) | undefined): void {
    if (params?.onHome) {
      this._onHomeCallback = params.onHome;
    }

    if (params?.onRestart) {
      this._onRestartCallback = params.onRestart;
    }
  }
}
