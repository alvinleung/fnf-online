import { isWindows } from "../../utils/platform";

function useBinding(mac: string, windows: string) {
  if (isWindows()) return windows;
  return mac;
}

const HotkeyConfig = {
  HIDE_UI: useBinding("cmd+\\", "ctrl+\\"),
  ESCAPE: useBinding("esc", "esc"),
};

export { HotkeyConfig };
