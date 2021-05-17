import React from "react";
import { resolveIcon } from "./AssetExplorerUtils";

export function FolderContentView(props) {
  return (
    <div className="folder-content-view">
      {props.currentDirContent &&
        props.currentDirContent.children.map((file, index) => {
          return (
            <button
              draggable="true"
              key={index}
              onClick={() => props.setSelectedItemPath(file.fullPath)}
              onDoubleClick={() => props.handleItemDoubleClick(file.name)}
              className={
                props.selectedItemPath === file.fullPath
                  ? "folder-content-view__item folder-content-view__item--selected"
                  : "folder-content-view__item"
              }
            >
              <img
                src={resolveIcon(file.name, props.currentDir, true)}
                draggable="false"
                alt="folder"
              />
              <span className="folder-content-view__item-label" draggable="false">
                {file.name}
              </span>
            </button>
          );
        })}
      {props.noFileInDirectory && <div>No files in directory</div>}
    </div>
  );
}
