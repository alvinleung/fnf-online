import { useEffect, useRef } from "react";

export default function useTriggerViewportContextMenu() {
  /**
   * Hacky way to allow context menu click in the game viewport
   */
  const entityContextMenuTriggerRef = useRef();
  useEffect(() => {
    const gameViewportContainer = document.querySelector("#game");
    const handleMenu = (e) => {
      //@ts-ignore
      entityContextMenuTriggerRef.current.handleContextClick(e);
    };
    gameViewportContainer.addEventListener("contextmenu", handleMenu);
    return () => {
      gameViewportContainer.removeEventListener("contextmenu", handleMenu);
    };
  }, []);

  return entityContextMenuTriggerRef;
}
