import React, { HTMLProps, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useFocus } from "../../hooks/useFocus";
import { HotkeyConfig } from "../../Hotkeys";
import { DraftEditField } from "../DraftEditing/DraftEditField";
import { DirItem } from "./AssetExplorer";
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
              onRename={props.onRename}
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
    <div
      tabIndex={0}
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
      <RenamableFileName
        onRename={props.onRename}
        file={props.file}
        isFocused={isFocused}
        style={{
          textAlign: "center",
        }}
      />
    </div>
  );
}

interface RenamableFileNameProps extends HTMLProps<HTMLInputElement> {
  onRename?: (path: string, newName: string) => void;
  file: DirItem;
  isFocused: boolean;
}

export function RenamableFileName(props: RenamableFileNameProps) {
  const [isRenaming, setIsRenaming] = useState(false);

  const commitNameChangeHandler = (val: string) => {
    // send rename request
    props.onRename && props.onRename(props.file.fullPath, val);
    setIsRenaming(false);
  };
  const abortNameChangeHandler = () => {
    setIsRenaming(false);
  };

  useEffect(() => {
    const rename = (e: KeyboardEvent) =>
      e.key === "Enter" && props.isFocused && !isRenaming && setIsRenaming(true);
    window.addEventListener("keydown", rename);
    return () => {
      window.removeEventListener("keydown", rename);
    };
  }, [props.isFocused, isRenaming]);

  return (
    <DraftEditField
      onCommit={commitNameChangeHandler}
      onDiscard={abortNameChangeHandler}
      //@ts-ignore
      value={props.file.name}
      editing={isRenaming}
      onDoubleClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRenaming(true);
      }}
      draggable={false}
      discardWhenClickoutside
      {...props}
    />
  );
}
