import { InputSourceFactory } from "./InputSystem";

class MouseInput extends InputSourceFactory {
  private isMouseDown = false;

  constructor() {
    super();
    this.addEventListeners();
  }

  private addEventListeners() {
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.isMouseDown = true;
  }
  private handleMouseUp(e: MouseEvent) {
    this.isMouseDown = false;
  }

  protected isActive(key: string): boolean {
    return this.isMouseDown;
  }

  protected getAxis(axis: string): number {
    return 0;
  }
}

export default MouseInput;
