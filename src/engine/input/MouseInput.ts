import {InputSourceFactory, AxisBinding} from "./InputSystem";

interface MouseAxisBinding extends AxisBinding {
  mouseInputType: string,
  initiateKey: string,
}

interface MousePosition {
  x: number;
  y: number;
}

class MouseInput extends InputSourceFactory {
  private currentMouse: MousePosition;
  private mouseDown: MousePosition;

  private axisBindings: { [axis: string]: MouseAxisBinding } = {};
  private mouseActiveParts = { buttons:{} };
  private SCALE_FACTOR = 0.01;
  private MOUSE_AXIS_MAX = 1;
  private MOUSE_BUTTON_NAME_MAP = {
    mouseleft:0,
    mousemiddle:1,
    mouseright:2
  }

  constructor() {
    super();
    this.addEventListeners();
    this.mouseDown = {
      x: 0,
      y: 0
    }
  }

  public createDragBinding(initiateKey: string, axis: string): MouseAxisBinding {

    //const initiateKey = axis;

    const axisBinding: MouseAxisBinding = {
      mouseInputType: "drag",
      axis: axis,
      initiateKey: initiateKey,
      //termiateKey: terminatekey,
      getAxis: this.getAxis.bind(this),
    };

    this.axisBindings[axis] = axisBinding;

    return axisBinding;
  }

  protected getAxis(axis: string): number {
    if (!this.axisBindings[axis]) return 0;

    const initiateKey = this.axisBindings[axis].initiateKey;
    const buttonNum = this.MOUSE_BUTTON_NAME_MAP[initiateKey];

    if(!this.mouseActiveParts.buttons[buttonNum]){
      return 0;
    }

    switch(this.axisBindings[axis].mouseInputType){
      case "drag":
        return this.getDragAxis(axis);
      default:
        return 0;
    }
  }

  private getDragAxis(axis: string): number {
    //console.log(this.currentMouse[axis])
    //console.log(this.mouseDown[axis])
    return Math.min((this.currentMouse[axis] - this.mouseDown[axis] ) * this.SCALE_FACTOR, this.MOUSE_AXIS_MAX);
  }


  private addEventListeners() {
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  private handleMouseDown(e: MouseEvent) {
    this.mouseActiveParts.buttons[e.button] = true;
    this.mouseDown.x = this.currentMouse.x;
    this.mouseDown.y = this.currentMouse.y;
  }
  private handleMouseUp(e: MouseEvent) {
    this.mouseActiveParts.buttons[e.button] = false;
  }
  private handleMouseMove(e: MouseEvent) {
    if(!this.currentMouse){
      const newCurrentMouse: MousePosition = {
        x: e.clientX,
        y: e.clientY
      };
      this.currentMouse = newCurrentMouse;
    }
    this.currentMouse.x = e.clientX;
    this.currentMouse.y = e.clientY;
  }

  protected isActive(key: string): boolean {
    const buttonNum = this.MOUSE_BUTTON_NAME_MAP[key];
    return this.mouseActiveParts.buttons[buttonNum];
  }

}

export default MouseInput;
