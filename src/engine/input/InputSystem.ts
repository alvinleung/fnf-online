// init the input system
// import KeyboardInput from "./KeyboardInput";
// import MouseInput from "./MouseInput";

interface KeyBinding {
  // the processor of the binding, eg. keyboard
  key: string;
  isActive(key: string): boolean;
}

interface AxisBinding {
  axis: string;
  getAxisChange(key: string): number;
  getAxis(key: string): number;
}

abstract class InputSourceFactory {
  constructor() {}

  protected abstract getAxisChange(axis: string): number;
  protected abstract isActive(axis: string): boolean;

  public createAxisBinding(axis: string): AxisBinding {
    return {
      axis: axis,
      getAxisChange: this.getAxisChange.bind(this),
      getAxis: this.getAxisChange.bind(this),
    };
  }

  public createKeyBinding(key: string): KeyBinding {
    return {
      key: key,
      isActive: this.isActive.bind(this),
    };
  }
}

class InputSystem {
  // action > binding name lookup
  private actionBindingLookup: { [actionName: string]: KeyBinding } = {};
  private axisBindingLookup: { [axisName: string]: AxisBinding } = {};

  public bindAction(actionName: string, binding: KeyBinding) {
    this.actionBindingLookup[actionName] = binding;
  }

  public bindAllActions(bindings: { [actionName: string]: KeyBinding }) {
    const _this = this;
    Object.keys(bindings).forEach((key) => {
      _this.bindAction(key, bindings[key]);
    });
  }

  public isActive(actionName: string): boolean {
    const actionBindingLookup = this.actionBindingLookup[actionName];
    if (!actionBindingLookup) {
      console.warn(`Input System: Action ${actionName} not found`);
      return false;
    }
    return actionBindingLookup.isActive(actionBindingLookup.key);
  }

  public bindAxis(axisName: string, axis: AxisBinding) {
    this.axisBindingLookup[axisName] = axis;
  }

  public getAxisChange(axisName: string): number {
    const axisBindingLookup = this.axisBindingLookup[axisName];
    if (!axisBindingLookup) {
      console.warn(`Input System:  ${axisName} not found`);
      return 0;
    }

    //console.log(axisName);

    return axisBindingLookup.getAxisChange(axisBindingLookup.axis);
  }

  public getAxis(axisName: string): number {
    const axisBindingLookup = this.axisBindingLookup[axisName];
    if (!axisBindingLookup) {
      console.warn(`Input System:  ${axisName} not found`);
      return 0;
    }

    //console.log(axisName);

    return axisBindingLookup.getAxis(axisBindingLookup.axis);
  }

}

export { KeyBinding, AxisBinding, InputSourceFactory };
export default InputSystem;
