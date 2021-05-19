import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
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
import { FolderTreeView } from "./TreeView";
import { FolderContentView } from "./FolderContentView";

import { Col, ColsWrapper, HOR_SEPERATOR, Row, RowsWrapper } from "../react-grid-resizable";
import { useAssetExplorerContext } from "./AssetExplorerContext";
import useForceUpdate from "../../hooks/useForceUpdate";
import { useFileDrop } from "../FileDrop/useFileDrop";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";

interface Props {
  onChange?: (resourcePath: string) => void;
}

export interface DirItem {
  name: string;
  fullPath: string;
  children: DirItem[];
  expanded: boolean;
}

const editorServerIO = EditorServerIO.getInstance();

export const AssetExplorer = ({ onChange }: Props) => {
  // check if there is global context
  const { setDefaultPath, defaultPath } = useAssetExplorerContext();

  // a copy of the file paths in the editor server
  const [localDirList, setLocalDirList] = useState<string[]>([]);

  // map representation of the dir list
  const [localDirMap, setLocalDirMap] = useState<DirItem>();

  // for navigation
  const [currentDir, setCurrentDir] = useState(withRoot(defaultPath));

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
        expandUntilFolder(localDirMap, targetFolder);
        //
        setSelectedItemPath(null);
        break;
      case FileTypes.IMAGE:
        // TODO: preview image
        break;
      case FileTypes.SOUND:
        // TODO: preview sound
        break;
    }
  };

  const forceUpdate = useForceUpdate();
  const expandUntilFolder = (localDirMap: DirItem, path: string) => {
    doUntilDir(localDirMap, path, (dir: DirItem, currentDir: string) => {
      dir.expanded = true;
    });

    // use force update to trigger
    forceUpdate();
  };

  // update the global default path when the user change
  useEffect(() => {
    setDefaultPath(currentDir);
  }, [currentDir]);

  //TODO: expand the tree view to the default folder when the list ready
  useEffect(() => {
    if (!localDirMap) return;
    // console.log(currentDir);
    expandUntilFolder(localDirMap, currentDir);
  }, [localDirMap]);

  // trigger onChange when selection changes
  useEffect(() => {
    onChange && onChange(selectedItemPath);
  }, [selectedItemPath]);

  // list out all the directories
  const fetchServerDirs = () => {
    editorServerIO.listAllFolders().then((val) => {
      setLocalDirList(val);
      setSelectedItemPath(null);
    });
  };
  useEffect(() => {
    fetchServerDirs(); // init all directories
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

  const fileDropHandler = useCallback(
    (file: File) => {
      // upload file here
      editorServerIO.writeFile(currentDir, file).then(() => {
        console.log("file written at " + currentDir);
        // refresh the folder
        fetchServerDirs();
      });
    },
    [currentDir]
  );

  const handleFolderCreation = () => {
    // create a dummy folder in the directory
    const folder = getDirFromMap(localDirMap, currentDir);
    // check if folder contain name
    const fileName = "new-folder";
    let count = 1;
    let currentFileName = fileName;

    const hasFileName = (fileName: string) =>
      folder.children.findIndex((item) => item.name === fileName) !== -1;

    while (hasFileName(currentFileName)) {
      currentFileName = `${currentFileName}-${count}`;
      count++;
    }

    editorServerIO.createFolder(currentDir, currentFileName).then(() => fetchServerDirs());
  };

  const handleFolderRename = (filePath: string, newName: string) => {
    // send rename message here
    console.log(filePath);
    console.log(newName);

    editorServerIO.rename(filePath, newName).then(() => {
      fetchServerDirs();
    });
  };

  const handleDirItemDelete = (pathString: string) => {
    if (confirm(`Delete "${path.basename(pathString)}"?`)) {
      // delete file
      console.log(`Deleting item "${path.basename(pathString)}".`);
      editorServerIO.delete(pathString).then(() => fetchServerDirs());
    }
  };

  useHotkeys(
    HotkeyConfig.DELETE,
    () => {
      handleDirItemDelete(selectedItemPath);
    },
    [selectedItemPath]
  );

  const dropAreaRef = useFileDrop(["image/png", "image/jpeg"], fileDropHandler);

  return (
    <div className="asset-explorer">
      <ColsWrapper separatorProps={HOR_SEPERATOR}>
        <Col initialWidth={200}>
          <FolderTreeView
            localDirMap={localDirMap}
            currentDir={currentDir}
            setCurrentDir={setCurrentDir}
            selectedItemPath={selectedItemPath}
            setSelectedItemPath={setSelectedItemPath}
            handleDirToggle={handleDirToggle}
            onRename={handleFolderRename}
          ></FolderTreeView>
        </Col>
        <Col>
          <div className="asset-explorer-main">
            <div className="asset-explorer__bottom-bar">
              <Breadcrumbs
                dir={localDirMap}
                currentDir={currentDir}
                setCurrentDir={setCurrentDir}
              />
            </div>
            <div className="asset-explorer__main-content" ref={dropAreaRef}>
              <h2 className="asset-explorer-header">{path.parse(currentDir).name}</h2>
              <ContextMenuTrigger id="asset-explorer-folder-content-view">
                <FolderContentView
                  currentDir={currentDir}
                  selectedItemPath={selectedItemPath}
                  setSelectedItemPath={setSelectedItemPath}
                  handleItemDoubleClick={handleItemDoubleClick}
                  currentDirContent={currentDirContent}
                  noFileInDirectory={noFileInDirectory}
                  onRename={handleFolderRename}
                ></FolderContentView>
              </ContextMenuTrigger>
              <ContextMenu id="asset-explorer-folder-content-view">
                <MenuItem onClick={handleFolderCreation}>New Folder</MenuItem>
                {selectedItemPath && (
                  <>
                    <MenuItem divider />
                    <MenuItem onClick={() => handleDirItemDelete(selectedItemPath)}>
                      Delete "{path.basename(selectedItemPath)}"
                    </MenuItem>
                    <MenuItem>Rename "{path.basename(selectedItemPath)}"</MenuItem>
                  </>
                )}
              </ContextMenu>
            </div>
          </div>
        </Col>
      </ColsWrapper>
    </div>
  );
};
