import { FancyButton, type ButtonOptions } from "@pixi/ui";

export class MenuButton extends FancyButton {
  private isDisabled = false;

  constructor(defaultView: string, disabledView?: string) {
    const options: ButtonOptions = {
      defaultView: `${defaultView}.png`,
      disabledView: disabledView ? `${disabledView}.png` : undefined,
      anchor: 0.5,
      animations: {
        hover: { props: { scale: { x: 1.1, y: 1.1 } }, duration: 100 },
        pressed: { props: { scale: { x: 0.9, y: 0.9 } }, duration: 100 },
      },
    };

    super(options);

    this.onPress.connect(() => this.toggle());

    this.onOut.connect(() => {
      if (this.isDisabled) {
        super.setState("disabled");
      }
    });
  }

  public isEnabled() {
    return !this.isDisabled;
  }

  public enable() {
    this.isDisabled = false;

    super.setState("default");
    this.alpha = 1;
  }

  disable() {
    this.isDisabled = true;

    this.setState("disabled");
    this.alpha = 0.5;
  }

  private toggle() {
    if (!this.disabledView) {
      return;
    }

    if (this.isDisabled) {
      this.enable();
    } else {
      this.disable();
    }
  }
}
