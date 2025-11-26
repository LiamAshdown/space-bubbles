import { Text } from "pixi.js";
import { Navigation } from "../../engine/navigation/navigation";
import { OverlayAbstract, type OverlayParams } from "./overlay";
import { FancyButton } from "@pixi/ui";
import { MenuButton } from "../ui/menu-button";
import { createTexture } from "../utils/sprite";
import type { Sound } from "../../engine/sound/sound";

export interface GameOverlayParams {
  score: number;
  onRestart: () => void;
}

export class GameOverOverlay extends OverlayAbstract {
  static SCREEN_ID = "game-over-overlay";

  private _gameOverText: Text;
  private readonly _scoreButton: FancyButton;
  private readonly _scoreButtonText: Text;
  private readonly _homeButton: MenuButton;
  private readonly _restartButton: MenuButton;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._gameOverText = new Text({
      text: "GAME OVER!",
      anchor: 0.5,
      style: {
        fill: "#7b76e6ff",
        fontSize: 52,
      },
    });

    this._scoreButtonText = new Text({
      text: "SCORE: 0",
      anchor: 0.5,
      style: {
        fill: "#ffffffff",
        fontSize: 42,
      },
    });

    this._scoreButton = new FancyButton({
      defaultView: createTexture("score_board"),
      anchor: 0.5,
    });

    this._homeButton = new MenuButton("btn_home");
    this._restartButton = new MenuButton("btn_restart");

    this.addChild(this._scoreButton);
    this.addChild(this._gameOverText);
    this.addChild(this._scoreButtonText);
    this.addChild(this._homeButton);
    this.addChild(this._restartButton);
  }

  onResize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._gameOverText.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 180
    );

    this._scoreButton.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 300
    );

    this._scoreButtonText.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 300
    );

    this._homeButton.position.set(
      logicalWidth / 2 - 130,
      logicalHeight / 2 - this._windowBackground.height / 2 + 440
    );

    this._restartButton.position.set(
      logicalWidth / 2 + 130,
      logicalHeight / 2 - this._windowBackground.height / 2 + 440
    );
  }

  protected onInit(params?: (OverlayParams & GameOverlayParams) | undefined): void {
    if (params?.score) {
      this._scoreButtonText.text = `SCORE: ${params.score}`;
    }

    this._restartButton.onPress.connect(() => {
      params?.onRestart();
    });
  }
}
