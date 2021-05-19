import React, { useEffect, useRef } from "react";
import { Game } from "../../../../Game";

/**
 * Enable scene import functions
 * @param game
 */
export const useFileDrop = (acceptFileTypes: string[], fileDropHandler: (file: File) => void) => {
  const dropAreaRef = useRef<HTMLDivElement>();
  useEffect(() => {
    const dropArea = dropAreaRef.current;
    // const acceptFileTypes = ["image/png", "image/jpg"];

    let didCancel = false;

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
      const droppedFiles: FileList = fileList;

      console.log(event.dataTransfer.files);

      // droppedFiles.forEach((droppedFile) => {

      for (let i = 0; i < droppedFiles.length; i++) {
        const droppedFile = droppedFiles[i];

        // typecheck the scene file
        if (!droppedFile.type) {
          console.warn("File type undefined, abort handling file drop.");
          return;
        }

        const isFileTypeAcceptable = acceptFileTypes.some((fileType) =>
          droppedFile.type.startsWith(fileType)
        );

        if (!isFileTypeAcceptable) {
          console.log(`File is not a ${acceptFileTypes} file.`, droppedFile.type, droppedFile);
          return;
        }

        fileDropHandler && fileDropHandler(droppedFile);
      }
    };

    dropArea.addEventListener("dragover", handleDragOver);
    dropArea.addEventListener("drop", handleDrop);

    return () => {
      didCancel = true;
      dropArea.removeEventListener("dragover", handleDragOver);
      dropArea.removeEventListener("drop", handleDrop);
    };
  }, [fileDropHandler]);

  return dropAreaRef;
};

export const useSceneFileDrop = (game: Game) => {
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

      // setup for firefox
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
