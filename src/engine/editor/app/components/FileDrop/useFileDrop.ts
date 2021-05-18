import React, { useEffect } from "react";
import { Game } from "../../../../Game";

export const useFileDrop = (game: Game) => {
  // for scene file drop
  useEffect(() => {
    const dropArea = document.querySelector("body");

    const handleDragOver = (event) => {
      event.stopPropagation();
      event.preventDefault();
      // Style the drag-and-drop as a "copy file" operation.
      event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event) => {
      event.stopPropagation();
      event.preventDefault();
      const fileList = event.dataTransfer.files;
      const sceneFile = fileList[0];

      // yet it is working
      // EditorServerIO.getInstance().writeFile(`./sceneData/${sceneFile.name}`, sceneFile);

      // typecheck the scene file
      if (sceneFile.type && !sceneFile.type.startsWith("application/json")) {
        console.log("File is not a text/json file.", sceneFile.type, sceneFile);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => game.loadScene(reader.result as string);
      reader.onerror = () => console.log(reader.error);

      reader.readAsText(sceneFile);
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, []);
};
