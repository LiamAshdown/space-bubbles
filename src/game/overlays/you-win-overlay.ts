import { Text, Texture } from "pixi.js";
import type { Navigation } from "../../engine/navigation/navigation";
import { OverlayAbstract, type OverlayParams } from "./overlay";
import { FancyButton } from "@pixi/ui";
import { MenuButton } from "../ui/menu-button";
import { createTexture } from "../utils/sprite";
import type { Sound } from "../../engine/sound/sound";

export interface YouWinOverlayParams {
  score: number;
  onHome: () => void;
}

export class YouWinOverlay extends OverlayAbstract {
  static SCREEN_ID = "you-win-over-overlay";

  private _youWinText: Text;
  private readonly _scoreButton: FancyButton;
  private readonly _scoreButtonText: Text;

  private readonly _homeButton: MenuButton;
  private readonly _nextLevelButton: MenuButton;
  private _onHomeCallback?: () => void;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._youWinText = new Text({
      text: "LEVEL 1\nCOMPLETED",
      anchor: 0.5,
      style: {
        fill: "#7b76e6ff",
        fontSize: 52,
        align: "center",
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
    this._nextLevelButton = new MenuButton("btn_next");

    this._homeButton.onPress.connect(() => {
      if (this._onHomeCallback) {
        this._onHomeCallback();
      }
    });

    this.addChild(this._youWinText);
    this.addChild(this._scoreButton);
    this.addChild(this._scoreButtonText);
    this.addChild(this._homeButton);
    this.addChild(this._nextLevelButton);
  }

  protected onResize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._youWinText.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 200
    );

    this._scoreButton.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 340
    );

    this._scoreButtonText.position.set(
      logicalWidth / 2,
      logicalHeight / 2 - this._windowBackground.height / 2 + 340
    );

    this._homeButton.position.set(
      logicalWidth / 2 - 130,
      logicalHeight / 2 - this._windowBackground.height / 2 + 480
    );

    this._nextLevelButton.position.set(
      logicalWidth / 2 + 130,
      logicalHeight / 2 - this._windowBackground.height / 2 + 480
    );
  }

  protected onInit(params?: (OverlayParams & YouWinOverlayParams) | undefined): void {
    if (params?.score) {
      this._scoreButtonText.text = `SCORE: ${params.score}`;
    }

    if (params?.onHome) {
      this._onHomeCallback = params.onHome;
    }
  }
}
