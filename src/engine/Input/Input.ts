// init the input system

import KeyboardInputProcessor from "./KeyboardInputProcessor";

interface KeyBinding {
  source: IInputSourceProcessor;
  // the processor of the binding, eg. keyboard
  key: string;
}

interface IInputSourceProcessor {
  // return if the user is pressing on a key
  isActive(key: string): boolean;
  // return if the key
  useKeyBinding(key: string): KeyBinding;
}

class InputSystem {
  // action > binding name lookup
  private actionBindingLookup: { [actionName: string]: KeyBinding } = {};

  public bindControl(actionName: string, binding: KeyBinding) {
    this.actionBindingLookup[actionName] = binding;
  }

  public bindAllControls(bindings: { [actionName: string]: KeyBinding }) {
    const _this = this;
    Object.keys(bindings).forEach((key) => {
      _this.bindControl(key, bindings[key]);
    });
  }

  public isActive(actionName: string): boolean {
    const actionBindingLookup = this.actionBindingLookup[actionName];
    if (actionBindingLookup) {
      return actionBindingLookup.source.isActive(actionBindingLookup.key);
    }
    return false;
  }
}

export { KeyBinding, IInputSourceProcessor, KeyboardInputProcessor };
export default new InputSystem();
