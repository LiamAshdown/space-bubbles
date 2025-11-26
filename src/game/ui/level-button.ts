import { FancyButton, type ButtonOptions } from "@pixi/ui";
import { LevelService } from "../service/level-service";
import { Text } from "pixi.js";

export class LevelButton extends FancyButton {
  constructor(state: number, level: number) {
    let view = "btn_level";
    let text = null;

    switch (state) {
      case LevelService.LEVEL_STATES.COMPLETED:
        view = "btn_level";
        text = new Text({
          text: level,
          anchor: 0.5,
          style: {
            fill: "#ffffffff",
            fontSize: 52,
            align: "center",
          },
        });
        break;
      case LevelService.LEVEL_STATES.NOT_COMPLETED:
        view = "btn_level_cur";
        text = new Text({
          text: level,
          anchor: 0.5,
          style: {
            fill: "#ffffffff",
            fontSize: 52,
            align: "center",
          },
        });
        break;
      case LevelService.LEVEL_STATES.LOCKED:
        view = "btn_level_lock";
        break;
    }

    const options: ButtonOptions = {
      defaultView: `${view}.png`,
      anchor: 0.5,
      animations: {
        hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    };

    super(options);

    if (text) {
      this.addChild(text);
    }
  }
}
