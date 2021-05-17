import path from "path";
import React from "react";
import { DirItem } from "./AssetExplorer";
import { splitPathIntoArray, withRoot } from "./AssetExplorerUtils";

import "./Breadcrumbs.css";

interface Props {
  currentDir: string;
  dir: DirItem;
  setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
}

const BASE_DIR_NAME = "assets";
const ICON_ARROW_RIGHT = require("url:../../images/arrow-right-nav.svg");

export const Breadcrumbs = ({ dir, currentDir, setCurrentDir }: Props) => {
  const splittedDir = splitPathIntoArray(currentDir);

  return (
    <div className="breadcrumbs">
      {splittedDir.map((dirName, index) => {
        const dirBefore = currentDir.split(dirName)[0];
        const fullDir = path.join(...dirBefore.split("/"), dirName);

        console.log(dirName);
        if (index === 0) {
          return (
            <button
              className="breadcrumbs__folder"
              key={index}
              onClick={() => setCurrentDir(withRoot(fullDir))}
            >
              {BASE_DIR_NAME}
            </button>
          );
        }

        return (
          <React.Fragment key={index}>
            <img src={ICON_ARROW_RIGHT} className="breadcrumbs__connector" />
            <button
              key={index}
              onClick={() => setCurrentDir(fullDir)}
              className="breadcrumbs__folder"
            >
              {dirName}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
