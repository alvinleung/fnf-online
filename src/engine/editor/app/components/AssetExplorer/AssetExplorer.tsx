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
import { DirectoryLevel, FolderTreeView } from "./TreeView";
import { FolderContentView } from "./FolderContentView";

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
        <FolderTreeView
          localDirMap={localDirMap}
          currentDir={currentDir}
          setCurrentDir={setCurrentDir}
          selectedItemPath={selectedItemPath}
          setSelectedItemPath={setSelectedItemPath}
          handleDirToggle={handleDirToggle}
        ></FolderTreeView>
      </div>
      <div className="folder-content-view-container asset-explorer__main-content">
        <h2 className="asset-explorer-header">{path.parse(currentDir).name}</h2>
        <FolderContentView
          currentDir={currentDir}
          selectedItemPath={selectedItemPath}
          setSelectedItemPath={setSelectedItemPath}
          handleItemDoubleClick={handleItemDoubleClick}
          currentDirContent={currentDirContent}
          noFileInDirectory={noFileInDirectory}
        ></FolderContentView>
      </div>
      <div className="asset-explorer__bottom-bar">
        <Breadcrumbs dir={localDirMap} currentDir={currentDir} setCurrentDir={setCurrentDir} />
      </div>
    </div>
  );
};
