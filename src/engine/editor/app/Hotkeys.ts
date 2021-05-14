import { isWindows } from "../../utils/platform";

function useBinding(mac: string, windows: string) {
  if (isWindows()) return windows;
  return mac;
}

const HotkeyConfig = {
  HIDE_UI: useBinding("cmd+\\", "ctrl+\\"),
  ESCAPE: useBinding("esc", "esc"),
  DELETE: useBinding("backspace", "del"),
  SUBMIT: useBinding("enter", "enter"),
  UNDO: useBinding("cmd+z", "ctrl+z"),
  REDO: useBinding("cmd+shift+z", "cmd+shift+z"),
};

export { HotkeyConfig };
