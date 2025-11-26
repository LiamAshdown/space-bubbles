import { FancyButton, type ButtonOptions } from "@pixi/ui";

export class PaginationButton extends FancyButton {
  constructor() {
    const options: ButtonOptions = {
      defaultView: "pagination_inactive.png",
      anchor: 0.5,
      animations: {
        hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    };

    super(options);
  }

  public active() {
    this.defaultView = "pagination_active.png";
  }

  public inactive() {
    this.defaultView = "pagination_inactive.png";
  }
}
