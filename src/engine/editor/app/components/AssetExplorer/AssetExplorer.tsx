import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { EditorServerIO } from "../../../EditorServerIO";
import path from "path";
import "./AssetExplorer.css";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  FileTypes,
  getDirFromMap,
  getFileType,
  isFolder,
  resolveIcon,
  withRoot,
} from "./AssetExplorerUtils";

interface Props {}

export interface DirItem {
  name: string;
  fullPath: string;
  children: DirItem[];
  expanded: boolean;
}

const editorServerIO = EditorServerIO.getInstance();

const ICON_FOLDER = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_FOLDER_OPEN = require("url:../../images/asset-explorer-icons/folder_open_white_24dp.svg");
const ICON_UNKNOWN = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_IMAGE = require("url:../../images/asset-explorer-icons/image_white_24dp.svg");

export const AssetExplorer = (props: Props) => {
  // a copy of the file structure in the system
  const [localDirList, setLocalDirList] = useState<string[]>([]);
  // map representation of the dir list
  const [localDirMap, setLocalDirMap] = useState<DirItem>();

  // for navigation
  const [currentDir, setCurrentDir] = useState(withRoot("/"));
  const [dirFiles, setDirFiles] = useState([]);
  const [selectedItemPath, setSelectedItemPath] = useState("");

  const handleItemDoubleClick = (target: string) => {
    // check it is folder or file
    const fileType = getFileType(target);

    switch (fileType) {
      case FileTypes.FOLDER:
        // navigate to that folder
        setCurrentDir(withRoot(path.join(currentDir, target)));
        break;
      case FileTypes.IMAGE:
        // TODO: preview image
        break;
      case FileTypes.SOUND:
        // TODO: preview sound
        break;
    }
  };

  // refresh the file explorer view
  useEffect(() => {
    if (!currentDir || !localDirMap) return;

    const pathFiles = getDirFromMap(localDirMap, currentDir);
    setDirFiles(pathFiles.children.map(({ name }) => name));
  }, [currentDir, localDirMap]);

  // list out all the directories
  useEffect(() => {
    editorServerIO.listAllFolders().then((val) => {
      setLocalDirList(val);
    });
  }, []);

  // refresh the local dir map when we get and update
  useEffect(() => {
    let result: DirItem[] = [];
    let level = { result };

    localDirList.forEach((path, index) => {
      let accumPath = "";

      path.split("/").reduce((r, name, i, a) => {
        accumPath += "/" + name;
        const accumPathCleaned = accumPath.substr(1);

        if (!r[name]) {
          r[name] = { result: [] };
          r.result.push({
            name,
            fullPath: accumPathCleaned,
            children: r[name].result,
            expanded: false,
          });
        }
        return r[name];
      }, level);
    });

    setLocalDirMap(result[0]);
  }, [localDirList]);

  const handleDirToggle = (path: string) => {
    const toggleDir = getDirFromMap(localDirMap, path);
    if (!isFolder(toggleDir.name)) return;

    toggleDir.expanded = !toggleDir.expanded;

    // trigger update
    setLocalDirMap({ ...localDirMap });

    // set current dir to that folder
    setCurrentDir(withRoot(path));
  };

  const currentDirContent = getDirFromMap(localDirMap, currentDir);
  const noFileInDirectory = currentDirContent && currentDirContent.children.length === 0;

  return (
    <div className="asset-explorer">
      <div className="asset-explorer__side-bar">
        <div className="file-tree">
          <DirectoryLevel
            dir={localDirMap}
            currentDir={currentDir}
            setCurrentDir={setCurrentDir}
            selectedItemPath={selectedItemPath}
            setSelectedItemPath={setSelectedItemPath}
            onToggleFolder={handleDirToggle}
          />
        </div>
      </div>
      <div className="folder-browser-container asset-explorer__main-content">
        <h2 className="asset-explorer-header">{path.parse(currentDir).name}</h2>
        <div className="folder-browser">
          {currentDirContent &&
            currentDirContent.children.map((file, index) => {
              return (
                <button
                  draggable="true"
                  key={index}
                  onClick={() => setSelectedItemPath(file.fullPath)}
                  onDoubleClick={() => handleItemDoubleClick(file.name)}
                  className={
                    selectedItemPath === file.fullPath
                      ? "folder-browser__item folder-browser__item--selected"
                      : "folder-browser__item"
                  }
                >
                  <img
                    src={resolveIcon(file.name, currentDir, true)}
                    draggable="false"
                    alt="folder"
                  />
                  <span className="folder-browser__item-label" draggable="false">
                    {file.name}
                  </span>
                </button>
              );
            })}
          {noFileInDirectory && <div>No files in directory</div>}
        </div>
      </div>
      <div className="asset-explorer__bottom-bar">
        <Breadcrumbs dir={localDirMap} currentDir={currentDir} setCurrentDir={setCurrentDir} />
      </div>
    </div>
  );
};

const DirectoryLevel = ({
  dir,
  currentDir,
  setCurrentDir,
  selectedItemPath,
  setSelectedItemPath,
  onToggleFolder,
}: {
  dir: DirItem;
  currentDir: string;
  setCurrentDir: Dispatch<SetStateAction<string>>;
  selectedItemPath: string;
  setSelectedItemPath: Dispatch<SetStateAction<string>>;
  onToggleFolder: (path: string) => void;
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
              >
                {item.name}
              </DirectoryItem>
            );
          })}
      </div>
    </>
  );
};

const DirectoryItem = ({ isSelected, onClick, onToggle, icon, children }) => {
  return (
    <button
      className={isSelected ? "file-tree__item file-tree__item--selected" : "file-tree__item"}
      onDoubleClick={onToggle}
      onClick={onClick}
    >
      <img onClick={onToggle} src={icon} alt="folder" />
      <span className="file-tree__item-label">{children}</span>
    </button>
  );
};
