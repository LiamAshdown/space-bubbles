import { Container, Graphics, Sprite } from "pixi.js";
import { gsap } from "gsap";
import { AbstractAppScreen, Navigation } from "../../engine/navigation/navigation";
import { createSprite } from "../utils/sprite";
import { LevelService } from "../service/level-service";
import { GridService } from "../service/grid-service";
import { EntityManager } from "../../engine/ecs/entity-manager";
import { LevelButton } from "../ui/level-button";
import { PaginationButton } from "../ui/pagination-button";
import { GameScreen } from "./game-screen";
import type { Sound } from "../../engine/sound/sound";

export class LevelScreen extends AbstractAppScreen {
  static SCREEN_ID = "level-screen";
  static ASSET_BUNDLES: string[] = ["game"];

  private readonly _background: Sprite;
  private readonly _levelWindow: Sprite;
  private _levelButtonsContainer: Container = new Container();
  private readonly _gameContainer: Container = new Container();
  private readonly _gameContainerBackground: Sprite;
  private _paginationContainer: Container = new Container();
  private _isAnimating: boolean = false;

  private _page = 0;
  private readonly _levelsPerPage = 16;
  private readonly _levelService: LevelService;

  private readonly _levelMask: Graphics = new Graphics();

  constructor(navigation: Navigation, sound: Sound) {
    super(navigation, sound);

    this._background = createSprite("bg_simple");
    this._levelWindow = createSprite("win_level", 0.5);

    this.addChild(this._background);

    this._gameContainerBackground = createSprite("bg_game");
    this._gameContainer.addChild(this._gameContainerBackground);

    this._levelService = new LevelService(
      new GridService(new EntityManager(), this._gameContainer)
    );

    this._gameContainer.addChild(this._levelWindow);
    this._gameContainer.addChild(this._levelButtonsContainer);

    this._levelButtonsContainer.mask = this._levelMask;
    this._gameContainer.addChild(this._levelMask);

    this.drawLevels();
    this.drawPagination();

    this.addChild(this._gameContainer);
  }

  show(): Promise<void> {
    this._levelService.sync();
    this.drawLevels();
    this.drawPagination();

    return new Promise((resolve) => resolve());
  }

  private drawLevels(nextPage: number = this._page) {
    if (this._isAnimating) {
      return;
    }

    const newContainer = new Container();
    newContainer.mask = this._levelMask;

    const levels = this._levelService.getLevels();
    const entries = Object.entries(levels);

    const start = nextPage * this._levelsPerPage;
    const end = start + this._levelsPerPage;
    const pageLevels = entries.slice(start, end);

    for (let i = 0; i < pageLevels.length; i++) {
      const [_, state] = pageLevels[i];
      const row = Math.floor(i / 4);
      const col = i % 4;

      const pageLevel = this._levelsPerPage > 0 ? 1 + nextPage * this._levelsPerPage + i : i + 1;

      const levelButton = new LevelButton(state, pageLevel);
      levelButton.position.x = 180 + col * 125;
      levelButton.position.y = 350 + row * 140;

      levelButton.onPress.connect(() => {
        this.sound.play("click");
        this.navigation.navigate(GameScreen, {
          level: pageLevel,
        });
      });

      newContainer.addChild(levelButton);
    }

    const oldContainer = this._levelButtonsContainer;

    newContainer.x = nextPage > this._page ? 800 : -800;
    this._gameContainer.addChild(newContainer);

    this._isAnimating = true;

    gsap.to(newContainer, { x: 0, duration: 0.5, ease: "power2.out" });
    gsap.to(oldContainer, {
      x: nextPage > this._page ? -800 : 800,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        this._gameContainer.removeChild(oldContainer);

        this._levelButtonsContainer = newContainer;
        this._levelButtonsContainer.mask = this._levelMask;

        this._isAnimating = false;

        this.updateMask();
      },
    });
  }

  private drawPagination() {
    if (this._paginationContainer) {
      this._gameContainer.removeChild(this._paginationContainer);
    }

    const paginationContainer = new Container();
    const totalLevels = Object.keys(this._levelService.getLevels()).length;
    const paginationItems = Math.ceil(totalLevels / this._levelsPerPage);
    const paginationButtons = [] as Array<PaginationButton>;

    for (let i = 0; i < paginationItems; i++) {
      const button = new PaginationButton();
      button.position.x = 200 + i * 70;
      button.position.y = 880;

      button.onPress.connect(() => {
        if (i === this._page || this._isAnimating) {
          return;
        }

        for (let j = 0; j < paginationItems; j++) {
          const paginatedButton = paginationButtons[j];
          if (j === i) {
            paginatedButton.active();
          } else {
            paginatedButton.inactive();
          }
        }

        this.drawLevels(i);

        this._page = i;
      });

      paginationButtons.push(button);

      paginationContainer.addChild(button);
    }

    paginationButtons[this._page].active();

    this._paginationContainer = paginationContainer;
    this._gameContainer.addChild(paginationContainer);
  }

  private updateMask() {
    this._levelMask.clear();
    this._levelMask.beginFill(0xffffff);
    this._levelMask.drawRect(
      this._levelWindow.x - this._levelWindow.width / 2,
      this._levelWindow.y - this._levelWindow.height / 2,
      this._levelWindow.width,
      this._levelWindow.height
    );
    this._levelMask.endFill();
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

    this._levelWindow.position.x = logicalWidth / 2;
    this._levelWindow.position.y = logicalHeight / 2;

    this._gameContainerBackground.width = logicalWidth;
    this._gameContainerBackground.height = logicalHeight;

    this.updateMask();
  }
}
