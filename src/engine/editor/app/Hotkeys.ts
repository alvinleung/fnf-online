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
  REDO: useBinding("cmd+shift+z", "ctrl+y"),
  COPY: useBinding("cmd+c", "ctrl+c"),
  PASTE: useBinding("cmd+v", "ctrl+v"),
  SAVE: useBinding("cmd+s", "ctrl+s"),
  OPEN: useBinding("cmd+o", "ctrl+o"),
};

export { HotkeyConfig };
