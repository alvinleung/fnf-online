import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { EditorServerIO } from "../../../EditorServerIO";
import path from "path";
import "./AssetExplorer.css";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  doUntilDir,
  FileTypes,
  getDirFromMap,
  getFileType,
  isFolder,
  withRoot,
} from "./AssetExplorerUtils";
import { DirectoryLevel, FolderTreeView } from "./TreeView";
import { FolderContentView } from "./FolderContentView";

interface Props {
  onChange: (resourcePath: string) => void;
}

export interface DirItem {
  name: string;
  fullPath: string;
  children: DirItem[];
  expanded: boolean;
}

const editorServerIO = EditorServerIO.getInstance();

export const AssetExplorer = ({ onChange }: Props) => {
  // a copy of the file paths in the editor server
  const [localDirList, setLocalDirList] = useState<string[]>([]);

  // map representation of the dir list
  const [localDirMap, setLocalDirMap] = useState<DirItem>();

  // for navigation
  const [currentDir, setCurrentDir] = useState(withRoot("/"));

  // for selection
  const [selectedItemPath, setSelectedItemPath] = useState("");

  const handleItemDoubleClick = (target: string) => {
    // check it is folder or file
    const fileType = getFileType(target);

    switch (fileType) {
      case FileTypes.FOLDER:
        const targetFolder = withRoot(path.join(currentDir, target));
        // navigate to that folder
        setCurrentDir(targetFolder);
        // expand the tree view to that folder
        expandUntilFolder(targetFolder);
        break;
      case FileTypes.IMAGE:
        // TODO: preview image
        break;
      case FileTypes.SOUND:
        // TODO: preview sound
        break;
    }
  };

  const expandUntilFolder = useCallback(
    (path: string) => {
      const newLocalDirMap = doUntilDir(localDirMap, path, (dir: DirItem, currentDir: string) => {
        dir.expanded = true;
      });

      setLocalDirMap(newLocalDirMap);
    },
    [localDirMap]
  );

  // trigger onChange when selection changes
  useEffect(() => {
    onChange && onChange(selectedItemPath);
  }, [selectedItemPath]);

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
