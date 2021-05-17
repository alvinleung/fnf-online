import path from "path";
import { DirItem } from "./AssetExplorer";

const ICON_FOLDER = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_FOLDER_OPEN = require("url:../../images/asset-explorer-icons/folder_open_white_24dp.svg");
const ICON_UNKNOWN = require("url:../../images/asset-explorer-icons/folder_white_24dp.svg");
const ICON_IMAGE = require("url:../../images/asset-explorer-icons/image_white_24dp.svg");

export const ROOT_DIR = "assets";

export const resolveIcon = (fileName, currentDir, showImage) => {
  const fileURL = path.join(currentDir, fileName);
  switch (getFileType(fileName)) {
    case FileTypes.IMAGE:
      if (showImage) return fileURL;
      else return ICON_IMAGE;
    case FileTypes.FOLDER:
      return ICON_FOLDER;
    default:
      return ICON_UNKNOWN;
  }
};

// let say assets = root
// eg. contain root -> /assets/test
// eg. contain root -> /
// eg. contain root -> assets
// eg. not contain root -> images/

// To check if the user accidently include root folder in the path
export const doesPathContainRootToken = (filePath: string) => {
  // if (filePath[0] === "/") return true;

  const rootDirIndex = filePath.indexOf(ROOT_DIR);
  if (rootDirIndex !== -1 && rootDirIndex < ROOT_DIR.length) return true;

  return false;
};

export const stripRoot = (filePath: string) => {
  if (!doesPathContainRootToken(filePath)) return filePath;

  const sanitizedFilePath = filePath.substr(ROOT_DIR.length);
  return sanitizedFilePath;
};

// to enforce the root format, make path safe
export const withRoot = (filePath: string) => {
  if (doesPathContainRootToken(filePath)) return filePath;
  return path.join(ROOT_DIR, filePath);
};

export const getDirFromMap = (localDirMap: DirItem, filePath: string) => {
  const rootlessPath = stripRoot(filePath);
  const pathArr = splitPathIntoArray(rootlessPath);

  // the client is asking for the root folder
  if (
    filePath === "" ||
    filePath === "/" ||
    filePath === "assets" ||
    filePath === "/assets" ||
    filePath === "assets/"
  ) {
    return localDirMap;
  }

  const result = pathArr.reduce((result: DirItem, currentDirName: string) => {
    if (!result) {
      console.warn(`Invalid path: ${filePath}`);
      return result;
    }

    result = result.children.find((item) => {
      return item.name === currentDirName;
    });

    return result;
  }, localDirMap);

  return result;
};

/**
 * Do something for each directory along the path
 * @param localDirMap
 * @param path
 * @param handler
 */
export const doUntilDir = (
  localDirMap: DirItem,
  path: string,
  handler: (dir: DirItem, currentDir: string) => void
) => {
  const pathArr = splitPathIntoArray(stripRoot(path));
  pathArr.reduce((map, currentDir, index) => {
    handler && handler(map, currentDir);
    return map.children.find(({ name }) => {
      return name === currentDir;
    });
  }, localDirMap);

  return localDirMap;
};

/**
 * Split each item on a string path in to an array
 * @param dirPath
 * @returns
 */
export const splitPathIntoArray = (dirPath: string) => {
  // make sure the path is in right format
  const noramlizePath = path.normalize(dirPath);
  const cleanedRootPath = noramlizePath[0] === "/" ? noramlizePath.substr(1) : noramlizePath;
  const pathArray = cleanedRootPath.split("/");

  // trim the last empty string path if it exits
  if (pathArray[pathArray.length - 1] === "") pathArray.pop();

  return pathArray;
};

export enum FileTypes {
  IMAGE = "image",
  SOUND = "sound",
  FOLDER = "folder",
}
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
export const SOUND_EXTENSIONS = [".mp3", ".ogg"];

export function getFileType(fileName: string): FileTypes {
  if (typeof fileName !== "string") return;

  const extResult = fileName.match(/\.[0-9a-z]+$/i);
  if (!extResult) return FileTypes.FOLDER;

  const ext = extResult[0];

  // check extensions against the pre defined ones
  const isImage = IMAGE_EXTENSIONS.some((extension) => ext === extension);
  if (isImage) return FileTypes.IMAGE;

  const isSound = SOUND_EXTENSIONS.some((extension) => ext === extension);
  if (isSound) return FileTypes.SOUND;

  return null;
}

export function isFolder(fileName: string) {
  return getFileType(fileName) === FileTypes.FOLDER;
}
