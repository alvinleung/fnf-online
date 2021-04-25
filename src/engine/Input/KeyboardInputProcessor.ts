import { IInputSourceProcessor, KeyBinding } from "./input";

class KeyboardInputProcessor implements IInputSourceProcessor {
  private asciiActiveKeys = {};

  constructor() {
    this.addEventListeners();
  }

  public isActive(key: string): boolean {
    return this.asciiActiveKeys[key];
  }

  public useKeyBinding(key: string): KeyBinding {
    return {
      source: this,
      key: key,
    };
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

export default KeyboardInputProcessor;
