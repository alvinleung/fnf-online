import React, { useEffect, useState } from "react";
import { EditorServerIO } from "../../../EditorServerIO";
import path from "path";
import "./AssetExplorer.css";
import { Breadcrumbs } from "./Breadcrumbs";

interface Props {}

const editorServerIO = EditorServerIO.getInstance();

const ICON_FOLDER = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_UNKNOWN = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_IMAGE = require("url:../../images/asset-explorer-icons/image_white_24dp.svg");

const resolveIcon = (fileName, currentDir, showImage) => {
  const fileURL = path.join("assets", currentDir, fileName);
  switch (getFileType(fileName)) {
    case FileTypes.IMAGE:
      if (showImage) return fileURL;
      else return ICON_IMAGE;
    case FileTypes.FOLDER:
      return ICON_FOLDER;
    default:
      return ICON_UNKNOWN;
  }
};

export const AssetExplorer = (props: Props) => {
  const [currentDir, setCurrentDir] = useState("");
  const [dirFiles, setDirFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleItemDoubleClick = (target: string) => {
    // check it is folder or file
    const fileType = getFileType(target);

    switch (fileType) {
      case FileTypes.FOLDER:
        // navigate to that folder
        setCurrentDir(path.join(currentDir, target));
        break;
      case FileTypes.IMAGE:
        // TODO: preview image
        break;
      case FileTypes.SOUND:
        // TODO: preview sound
        break;
    }
  };

  useEffect(() => {
    editorServerIO.listFolder(currentDir).then((files) => {
      setDirFiles(files);
    });
  }, [currentDir]);

  return (
    <div className="asset-explorer">
      <div className="asset-explorer__side-bar">
        <div className="file-tree">
          {dirFiles.map((file, index) => {
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                onDoubleClick={() => handleItemDoubleClick(dirFiles[index])}
                className={
                  index === selectedIndex
                    ? "file-tree__item file-tree__item--selected"
                    : "file-tree__item"
                }
              >
                <img src={resolveIcon(file, currentDir, false)} alt="folder" />
                <span className="file-tree__item-label">{file}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="file-explorer-container asset-explorer__main-content">
        <h2 className="asset-explorer-header">Project Assets</h2>
        <div className="file-explorer">
          {dirFiles.map((file, index) => {
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                onDoubleClick={() => handleItemDoubleClick(dirFiles[index])}
                className={
                  index === selectedIndex
                    ? "file-explorer__item file-explorer__item--selected"
                    : "file-explorer__item"
                }
              >
                <img src={resolveIcon(file, currentDir, true)} alt="folder" />
                <span className="file-explorer__item-label">{file}</span>
              </button>
            );
          })}
          {dirFiles.length === 0 && <div>No files in directory</div>}
        </div>
      </div>
      <div className="asset-explorer__bottom-bar">
        <Breadcrumbs currentDir={currentDir} setCurrentDir={setCurrentDir} />
      </div>
    </div>
  );
};

enum FileTypes {
  IMAGE = "image",
  SOUND = "sound",
  FOLDER = "folder",
}
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const SOUND_EXTENSIONS = [".mp3", ".ogg"];

function getFileType(fileName: string): FileTypes {
  if (typeof fileName !== "string") return;

  const extResult = fileName.match(/\.[0-9a-z]+$/i);
  if (!extResult) return FileTypes.FOLDER;

  const ext = extResult[0];

  // check extensions against the pre defined ones
  const isImage = IMAGE_EXTENSIONS.some((extension) => ext === extension);
  if (isImage) return FileTypes.IMAGE;

  const isSound = SOUND_EXTENSIONS.some((extension) => ext === extension);
  if (isSound) return FileTypes.SOUND;

  return null;
}
