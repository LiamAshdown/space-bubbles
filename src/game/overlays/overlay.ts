import { Graphics, NineSliceSprite, Sprite } from "pixi.js";
import { AbstractAppScreen, Navigation } from "../../engine/navigation/navigation";
import { FancyButton } from "@pixi/ui";
import { createSprite, createTexture } from "../utils/sprite";
import type { Sound } from "../../engine/sound/sound";

export interface OverlayParams {
  textHeader: string;
  hideClose?: boolean;
}

export abstract class OverlayAbstract<
  T extends OverlayParams = OverlayParams,
> extends AbstractAppScreen<T> {
  private readonly _background: Graphics;
  protected readonly _windowBackground: NineSliceSprite;
  private readonly _closeButton: FancyButton;
  private _textHeader?: Sprite;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    // Fullscreen dim background
    this._background = new Graphics().rect(0, 0, 1, 1).fill({ color: "black", alpha: 0.5 });
    this.addChild(this._background);

    this._windowBackground = new NineSliceSprite({
      texture: createTexture("window"),
      leftWidth: 15,
      rightWidth: 15,
      topHeight: 15,
      bottomHeight: 15,
      width: 600,
      height: 600,
    });
    this._windowBackground.anchor.set(0.5);
    this.addChild(this._windowBackground);

    this._closeButton = new FancyButton({
      defaultView: createTexture("btn_close"),
      anchor: 0.5,
      animations: {
        hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    });
    this._closeButton.onDown.connect(() => {
      this.sound.play("click");
      this.navigation.hideOverlay();
    });
    this.addChild(this._closeButton);
  }

  init(params?: T): void {
    if (params?.textHeader) {
      if (!this._textHeader) {
        this._textHeader = createSprite(params.textHeader, 0.5);
        this.addChild(this._textHeader);
      } else {
        this._textHeader.texture = createTexture(params.textHeader);
      }
    }

    if (params?.hideClose) {
      this.removeChild(this._closeButton);
    }

    this.onInit(params);
  }

  resize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    this._background.width = screenWidth;
    this._background.height = screenHeight;

    this.scaleContainerToLogicalSize(this, logicalWidth, logicalHeight, screenWidth, screenHeight);

    this._windowBackground.position.set(logicalWidth / 2, logicalHeight / 2);

    this._closeButton.position.set(
      logicalWidth / 2 + this._windowBackground.width / 2 - 30,
      logicalHeight / 2 - this._windowBackground.height / 2 + 30
    );

    if (this._textHeader) {
      this._textHeader.scale.set(0.8);
      this._textHeader.position.set(
        logicalWidth / 2,
        logicalHeight / 2 - this._windowBackground.height / 2 + 50
      );
    }

    this.onResize(logicalWidth, logicalHeight, screenWidth, screenHeight);
  }

  protected abstract onResize(
    logicalWidth: number,
    logicalHeight: number,
    screenWidth: number,
    screenHeight: number
  ): void;
  protected abstract onInit(params?: T): void;
}
