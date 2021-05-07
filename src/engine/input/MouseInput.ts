import MyGame from "../../MyGame";
import { System } from "../ecs";
import { Game } from "../Game";
import {InputSourceFactory, AxisBinding} from "./InputSystem";

const VERBOSE = false;

interface MouseAxisBinding extends AxisBinding {
  axis: string;
  getAxis(key: string): number;
  
}

interface MousePosition {
  x: number;
  y: number;
}

class MouseInput extends InputSourceFactory {

  private game: Game;
  private axisBindings: { [axis: string]: MouseAxisBinding } = {};
  private mouseActiveParts = { buttons:{} };
  private mouseActivePartsInCanvas = { buttons:{} };
  private mouseClickRegister = { buttons:{} };

  private currentMouse: MousePosition;
  private cacheMouse: MousePosition;
  private mouseDown: MousePosition;
  // pointers
  private usePointerLocking: boolean;
  private pointerLocked: boolean;
  private pointerLockingButton: string;

  // constants
  private SENSITIVITY = 0.08;
  private MOUSE_BUTTON_NAME_MAP = {
    mouseleft:0,
    mousemiddle:1,
    mouseright:2
  }

  constructor(game: Game) {
    super();
    this.addEventListeners(game);
    this.game = game;
    this.initCacheMouse()
    this.pointerLockingButton = "all";
  }

  public createAxisBinding(axis: string): MouseAxisBinding {

    const axisBinding: MouseAxisBinding = {
      axis: axis,
      getAxisChange: this.getAxisChange.bind(this),
      getAxis: this.getAxis.bind(this),
    };

    this.axisBindings[axis] = axisBinding;

    return axisBinding;
  }

  protected getAxisChange(axis: string): number {
    if (!this.axisBindings[axis] || !this.currentMouse) return 0;
    if(this.usePointerLocking){
      if(!this.pointerLocked){
        //console.log("return 0")
        return 0;
      }
    }
    let velocity = 0;
    const axisBinding = this.axisBindings[axis].axis;
    velocity = this.currentMouse[axisBinding] - this.cacheMouse[axisBinding];
    this.cacheMouse[axisBinding] = this.currentMouse[axisBinding];
    
    velocity = velocity * this.SENSITIVITY * 0.5;
    return velocity;
  }
  protected getAxis(axis: string): number {
    if (!this.axisBindings[axis] || !this.currentMouse) return 0;
    const axisBinding = this.axisBindings[axis].axis;
    return this.currentMouse[axisBinding]
  }

  private addEventListeners(game:Game) {
    let canvas = game.getCanvas();
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
    canvas.addEventListener("mousedown", this.handleMouseDownInCanvas.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));

    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
  }
  private lockChangeAlert(){
    const canvas = this.game.getCanvas();
    if(document.pointerLockElement === canvas ||
      //@ts-ignore
      document.mozPointerLockElement === canvas) {
        VERBOSE && console.log('The pointer lock status is now locked');
        // Do something useful in response
        this.currentMouse.x = canvas.width / 2;
        this.currentMouse.y = canvas.height / 2;
        this.cacheMouse.x = this.currentMouse.x;
        this.cacheMouse.y = this.currentMouse.y;
        this.pointerLocked = true;
      } else {
        VERBOSE && console.log("The pointer lock status is now unlocked");
        // Do something useful in response
        this.pointerLocked = false;
      }
  }
  private initCacheMouse(){
    const newMousePosition: MousePosition = {
      x: 0,
      y: 0
    };
    this.cacheMouse = newMousePosition;
  }

  public enablePointerLockSetting(){
    this.usePointerLocking = true;
  }
  public setPointerLockButton(button:string){
    this.pointerLockingButton = button;
  }

  private handleMouseDown(e: MouseEvent) {
    this.mouseActiveParts.buttons[e.button] = true;
    if(!this.mouseDown){
      const newMousePosition: MousePosition = {
        x: this.currentMouse.x,
        y: this.currentMouse.y
      };
      this.mouseDown = newMousePosition;
    }
    this.mouseDown.x = this.currentMouse.x;
    this.mouseDown.y = this.currentMouse.y;
  }
  private handleMouseDownInCanvas(e: MouseEvent) {
    this.mouseActivePartsInCanvas.buttons[e.button] = true;

    // lock pointer
    const button = this.MOUSE_BUTTON_NAME_MAP[this.pointerLockingButton];
    if(this.usePointerLocking ){
      if(e.button == button || this.pointerLockingButton == "all" ){
        e.preventDefault();
        const element = this.game.getCanvas() as Element;
        element.requestPointerLock();
      }
    }

    // mouse click register
    if(this.mouseClickRegister.buttons[e.button] != 0 && !this.mouseClickRegister.buttons[e.button]){
      this.mouseClickRegister.buttons[e.button] = 1;
    } else {
      this.mouseClickRegister.buttons[e.button] = this.mouseClickRegister.buttons[e.button] + 1;
    }
  }
  private handleMouseUp(e: MouseEvent) {
    this.mouseActiveParts.buttons[e.button] = false;
    this.mouseActivePartsInCanvas.buttons[e.button] = false;
  }
  private handleMouseMove(e: MouseEvent) {
    if(!this.currentMouse){
      const newCurrentMouse: MousePosition = {
        x: e.clientX,
        y: e.clientY
      };
      this.currentMouse = newCurrentMouse;
    }

    if(this.pointerLocked){
      this.cacheMouse.x -= e.movementX
      this.cacheMouse.y += e.movementY;
    } else {
      this.currentMouse.x = e.clientX;
      this.currentMouse.y = e.clientY;
    }
  }

  protected isActive(key: string): boolean {
    const buttonNum = this.MOUSE_BUTTON_NAME_MAP[key];
    return this.mouseActiveParts.buttons[buttonNum];
  }
  protected wasClicked(key: string): boolean {
    const buttonNum = this.MOUSE_BUTTON_NAME_MAP[key];
    if(!this.mouseClickRegister.buttons[buttonNum]){
      return false;
    } else {
      this.mouseClickRegister.buttons[buttonNum] = 0;
      return true;
    }
  }

}

export default MouseInput;
