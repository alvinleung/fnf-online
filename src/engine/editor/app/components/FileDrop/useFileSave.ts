import { useHotkeys } from "react-hotkeys-hook";
import { Game } from "../../../../Game";
import { downloadFile } from "../../../../utils/DownloadFile";
import { HotkeyConfig } from "../../Hotkeys";
/**
 * Enable scene saving function
 * @param game
 */
export const useFileSave = (game: Game) => {
  useHotkeys(HotkeyConfig.SAVE, (e) => {
    e.preventDefault();
    const serializedScene = game.saveScene();
    downloadFile(serializedScene, "Scene.json", "application/json");
  });
};
