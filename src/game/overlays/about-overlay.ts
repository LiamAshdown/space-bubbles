import { Container, Graphics, Text } from "pixi.js";
import { Navigation } from "../../engine/navigation/navigation";
import type { Sound } from "../../engine/sound/sound";
import { OverlayAbstract, type OverlayParams } from "./overlay";

export class AboutOverlay extends OverlayAbstract {
  static SCREEN_ID = "about-overlay";
  static ASSET_BUNDLES: string[] = ["game"];

  private readonly _titleText: Text;
  private readonly _builtByText: Text;
  private readonly _divider1: Graphics;
  private readonly _techLabel: Text;
  private readonly _technologyText: Text;
  private readonly _assetsLabel: Text;
  private readonly _assetsText: Text;
  private readonly _assetsCopyrightText: Text;
  private readonly _divider2: Graphics;
  private readonly _githubLinkText: Text;
  private readonly _contentContainer: Container;

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._contentContainer = new Container();
    this.addChild(this._contentContainer);

    const bubbleEmojis = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"];
    const randomBubble = bubbleEmojis[Math.floor(Math.random() * bubbleEmojis.length)];

    this._titleText = new Text({
      text: `${randomBubble} Space Bubbles`,
      anchor: 0.5,
      style: {
        fill: "#2d3436",
        fontSize: 42,
        fontWeight: "bold",
        dropShadow: {
          alpha: 0.3,
          angle: Math.PI / 6,
          blur: 4,
          color: "#000000",
          distance: 3,
        },
      },
    });
    this._contentContainer.addChild(this._titleText);

    this._builtByText = new Text({
      text: "Built by Liam Ashdown",
      anchor: 0.5,
      style: {
        fill: "#7b76e6ff",
        fontSize: 28,
        fontWeight: "600",
      },
    });
    this._contentContainer.addChild(this._builtByText);

    this._divider1 = new Graphics().rect(-150, 0, 300, 2).fill({ color: "#7b76e6ff", alpha: 0.3 });
    this._contentContainer.addChild(this._divider1);

    this._techLabel = new Text({
      text: "Technology",
      anchor: 0.5,
      style: {
        fill: "#636e72",
        fontSize: 18,
        fontWeight: "500",
      },
    });
    this._contentContainer.addChild(this._techLabel);

    this._technologyText = new Text({
      text: "PixiJS + TypeScript",
      anchor: 0.5,
      style: {
        fill: "#2d3436",
        fontSize: 26,
        fontWeight: "600",
      },
    });
    this._contentContainer.addChild(this._technologyText);

    this._assetsLabel = new Text({
      text: "Assets",
      anchor: 0.5,
      style: {
        fill: "#636e72",
        fontSize: 18,
        fontWeight: "500",
      },
    });
    this._contentContainer.addChild(this._assetsLabel);

    this._assetsText = new Text({
      text: "Made by RedFoc",
      anchor: 0.5,
      style: {
        fill: "#2d3436",
        fontSize: 22,
        fontWeight: "600",
      },
    });
    this._contentContainer.addChild(this._assetsText);

    this._assetsCopyrightText = new Text({
      text: "© All rights reserved",
      anchor: 0.5,
      style: {
        fill: "#636e72",
        fontSize: 14,
        fontWeight: "400",
      },
    });
    this._contentContainer.addChild(this._assetsCopyrightText);

    this._divider2 = new Graphics().rect(-150, 0, 300, 2).fill({ color: "#7b76e6ff", alpha: 0.3 });
    this._contentContainer.addChild(this._divider2);

    this._githubLinkText = new Text({
      text: "🔗 View on GitHub",
      anchor: 0.5,
      style: {
        fill: "#4a9eff",
        fontSize: 20,
        fontWeight: "600",
      },
    });
    this._githubLinkText.eventMode = "static";
    this._githubLinkText.cursor = "pointer";

    this._githubLinkText.on("pointerover", () => {
      this._githubLinkText.scale.set(1.05);
      this._githubLinkText.style.fill = "#66b3ff";
    });
    this._githubLinkText.on("pointerout", () => {
      this._githubLinkText.scale.set(1);
      this._githubLinkText.style.fill = "#4a9eff";
    });
    this._githubLinkText.onpointerdown = () => {
      this.sound.play("click");
      window.open("https://github.com/LiamAshdown/space-bubbles", "_blank");
    };
    this._contentContainer.addChild(this._githubLinkText);
  }

  protected onResize(
    logicalWidth: number,
    logicalHeight: number,
    _screenWidth: number,
    _screenHeight: number
  ): void {
    const centerX = logicalWidth / 2;
    const startY = logicalHeight / 2 - this._windowBackground.height / 2 + 180;
    let yOffset = 0;

    this._contentContainer.position.set(centerX, startY);

    this._titleText.y = yOffset;
    yOffset += 60;

    this._builtByText.y = yOffset;
    yOffset += 50;

    this._divider1.y = yOffset;
    yOffset += 35;

    this._techLabel.y = yOffset;
    yOffset += 30;
    this._technologyText.y = yOffset;
    yOffset += 45;

    this._assetsLabel.y = yOffset;
    yOffset += 30;
    this._assetsText.y = yOffset;
    yOffset += 30;
    this._assetsCopyrightText.y = yOffset;
    yOffset += 50;

    this._divider2.y = yOffset;
    yOffset += 40;

    this._githubLinkText.y = yOffset - 10;
  }

  protected onInit(_params?: OverlayParams | undefined): void {}
}
