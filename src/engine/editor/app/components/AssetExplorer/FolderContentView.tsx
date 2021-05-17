import React from "react";
import { useFocus } from "../../hooks/useFocus";
import { resolveIcon } from "./AssetExplorerUtils";

import "./FolderContentView.css";

export function FolderContentView(props) {
  return (
    <div className="folder-content-view">
      {props.currentDirContent &&
        props.currentDirContent.children.map((file, index) => {
          return (
            <FolderItem
              key={index}
              setSelectedItemPath={props.setSelectedItemPath}
              handleItemDoubleClick={props.handleItemDoubleClick}
              selectedItemPath={props.selectedItemPath}
              currentDir={props.currentDir}
              file={file}
            ></FolderItem>
          );
        })}
      {props.noFileInDirectory && <div>No files in directory</div>}
    </div>
  );
}

function FolderItem(props) {
  const [focusRef, isFocused] = useFocus();

  const focusClass = isFocused ? " folder-content-view__item--focused" : "";
  return (
    <button
      ref={focusRef}
      draggable="true"
      onClick={() => props.setSelectedItemPath(props.file.fullPath)}
      onDoubleClick={() => props.handleItemDoubleClick(props.file.name)}
      className={
        props.selectedItemPath === props.file.fullPath
          ? "folder-content-view__item folder-content-view__item--selected" + focusClass
          : "folder-content-view__item" + focusClass
      }
    >
      <img
        src={resolveIcon(props.file.name, props.currentDir, true)}
        draggable="false"
        alt="folder"
      />
      <span className="folder-content-view__item-label" draggable="false">
        {props.file.name}
      </span>
    </button>
  );
}
