import path from "path";
import React from "react";

interface Props {
  currentDir: string;
  setCurrentDir: React.Dispatch<React.SetStateAction<string>>;
}

const BASE_DIR_NAME = "assets";
const ICON_ARROW_RIGHT = require("url:../../images/arrow-right-nav.svg");

export const Breadcrumbs = ({ currentDir, setCurrentDir }: Props) => {
  return (
    <div className="breadcrumbs">
      <button className="breadcrumbs__folder" onClick={() => setCurrentDir("/")}>
        {BASE_DIR_NAME}
      </button>
      {currentDir.split("/").map((dirName, index) => {
        // the final tail of split(junk)
        if (!dirName) return;

        const dirBefore = currentDir.split(dirName)[0];
        const fullDir = path.join(...dirBefore.split("/"), dirName);

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
