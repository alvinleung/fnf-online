import { useEffect, useRef } from "react";

/**
 * Hacky way to allow context menu click on game viewport.
 * This is created for the purpose of entity manipulation by
 * right click in viewport
 * @returns
 */
export default function useTriggerViewportContextMenu() {
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
