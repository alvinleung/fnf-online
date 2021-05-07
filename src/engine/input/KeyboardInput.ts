import { AxisBinding, InputSourceFactory, KeyBinding } from "./InputSystem";

interface KeyboardAxisBinding extends AxisBinding {
  positiveKey: string;
  negativeKey: string;
}

class KeyboardInput extends InputSourceFactory {
  private asciiActiveKeys = {};
  private axisBindings: { [axis: string]: KeyboardAxisBinding } = {};

  constructor() {
    super();
    this.addEventListeners();
  }

  protected getAxisChange(axis: string): number {
    if (!this.axisBindings[axis]) return 0;

    const positiveKey = this.axisBindings[axis].positiveKey;
    const negativeKey = this.axisBindings[axis].negativeKey;

    const negative = this.asciiActiveKeys[positiveKey] ? -1 : 0;
    const positive = this.asciiActiveKeys[negativeKey] ? 1 : 0;

    return negative + positive;
  }

  protected isActive(key: string): boolean {
    return this.asciiActiveKeys[key];
  }
  protected wasClicked(key: string): boolean{
    //TODO: not implemented yet
    return this.asciiActiveKeys[key];
  }

  // eg KeyA|KeyB means A is negative, B is positive
  public createAxisBinding(axis: string): KeyboardAxisBinding {
    // compile the positive key and negative key
    const splitKeyResult = axis.split("|");
    const positiveKey = splitKeyResult[0];
    const negativekey = splitKeyResult[1];

    const axisBinding: KeyboardAxisBinding = {
      axis: axis,
      positiveKey: positiveKey,
      negativeKey: negativekey,
      getAxisChange: this.getAxisChange.bind(this),
      getAxis: this.getAxisChange.bind(this),
    };

    this.axisBindings[axis] = axisBinding;

    return axisBinding;
  }

  private addEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.asciiActiveKeys[e.code] = true;
  }
  private handleKeyUp(e: KeyboardEvent) {
    this.asciiActiveKeys[e.code] = false;
  }
}

export default KeyboardInput;
