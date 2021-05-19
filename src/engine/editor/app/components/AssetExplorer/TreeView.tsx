import React, { useEffect, useRef, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import { useFocus } from "../../hooks/useFocus";
import { DirItem } from "./AssetExplorer";
import { isFolder, resolveIcon } from "./AssetExplorerUtils";
import { RenamableFileName } from "./FolderContentView";

import "./TreeView.css";

const ICON_FOLDER = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_FOLDER_OPEN = require("url:../../images/asset-explorer-icons/folder_open_white_24dp.svg");
const ICON_UNKNOWN = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_IMAGE = require("url:../../images/asset-explorer-icons/image_white_24dp.svg");

export function FolderTreeView(props) {
  const [focusRef, isFocused] = useFocus();

  return (
    <div className={isFocused ? "tree-view tree-view--focused" : "tree-view"} ref={focusRef}>
      <DirectoryLevel
        dir={props.localDirMap}
        currentDir={props.currentDir}
        setCurrentDir={props.setCurrentDir}
        selectedItemPath={props.selectedItemPath}
        setSelectedItemPath={props.setSelectedItemPath}
        onToggleFolder={props.handleDirToggle}
        onRename={props.onRename}
      />
    </div>
  );
}

export const DirectoryLevel = ({
  dir,
  currentDir,
  setCurrentDir,
  selectedItemPath,
  setSelectedItemPath,
  onToggleFolder,
  onRename,
}: {
  dir: DirItem;
  currentDir: string;
  setCurrentDir: Dispatch<SetStateAction<string>>;
  selectedItemPath: string;
  setSelectedItemPath: Dispatch<SetStateAction<string>>;
  onToggleFolder: (path: string) => void;
  onRename: (path: string, newFileName: string) => void;
}) => {
  if (!dir) return <></>;

  const handlItemSelect = (path: string, isFolder: boolean) => {
    setSelectedItemPath(path);
    isFolder === true && setCurrentDir(path);
  };

  return (
    <>
      <DirectoryItem
        isSelected={dir.fullPath === selectedItemPath}
        onToggle={() => onToggleFolder(dir.fullPath)}
        onClick={() => handlItemSelect(dir.fullPath, isFolder(dir.name))}
        icon={dir.expanded ? ICON_FOLDER_OPEN : ICON_FOLDER}
        onRename={onRename}
        file={dir}
      >
        {dir.name}
      </DirectoryItem>
      <div style={{ paddingLeft: "var(--spacing-s)" }}>
        {dir.expanded &&
          dir.children.map((item, index) => {
            // if (selectedItemPath.includes(item.fullPath)) item.expanded = true;

            if (item.expanded) {
              // there are sub folder
              return (
                <DirectoryLevel
                  key={index}
                  dir={item}
                  currentDir={currentDir}
                  setSelectedItemPath={setSelectedItemPath}
                  selectedItemPath={selectedItemPath}
                  onToggleFolder={onToggleFolder}
                  setCurrentDir={setCurrentDir}
                  onRename={onRename}
                />
              );
            }

            return (
              <DirectoryItem
                key={index}
                isSelected={item.fullPath === selectedItemPath}
                onToggle={() => onToggleFolder(item.fullPath)}
                onClick={() => {
                  handlItemSelect(item.fullPath, isFolder(item.name));
                }}
                icon={resolveIcon(item.name, currentDir, false)}
                file={item}
                onRename={onRename}
              >
                {item.name}
              </DirectoryItem>
            );
          })}
      </div>
    </>
  );
};

const DirectoryItem = ({ isSelected, onClick, onToggle, icon, children, file, onRename }) => {
  return (
    <button
      className={isSelected ? "tree-view__item tree-view__item--selected" : "tree-view__item"}
      onDoubleClick={onToggle}
      onClick={onClick}
    >
      <img onClick={onToggle} src={icon} alt="folder" />
      <span className="tree-view__item-label">
        <RenamableFileName onRename={onRename} file={file} isFocused={isSelected} />
        {/* {children} */}
      </span>
    </button>
  );
};
