import path from "path";
import { splitPath } from "../utils/StringUtils";
import { stripRoot } from "./app/components/AssetExplorer/AssetExplorerUtils";

// editor enviornmnet oknly available in localhost
const EDITOR_ENV = location.hostname === "localhost" || location.hostname === "127.0.0.1";

/**
 * Singleton for handling editor server file read write
 */

export class EditorServerIO {
  private constructor() {}

  private static _instance: EditorServerIO;
  public static getInstance() {
    if (!EditorServerIO._instance) {
      EditorServerIO._instance = new EditorServerIO();
    }
    return EditorServerIO._instance;
  }

  public async listAllFolders() {
    if (!EDITOR_ENV) {
      console.warn(`Aborting: getFolderStructure only available when running on editor server.`);
      return;
    }
    const response = await fetch("/listAllFolders");

    return response.json();
  }

  /**
   * List folder content in path.
   * @param path Path relative to the editor server-defined base path
   * @returns
   */
  public async listFolder(path: string) {
    if (!EDITOR_ENV) {
      console.warn(`Aborting: listFolder only available when running on editor server.`);
      return;
    }

    const response = await fetch("/listFolder", {
      method: "GET",
      headers: {
        listpath: path,
      },
    });

    return response.json();
  }

  /**
   * Write file at directory. If the path does not include file name, it will automatically inferred from the file.
   * @param path
   * @param file
   * @returns
   */
  public async writeFile(targetPath: string, file: File) {
    if (!EDITOR_ENV) {
      console.warn(`Aborting: Writing only available when running on editor server.`);
      return;
    }
    const formData = new FormData();
    formData.append("fileUploadField", file);

    // infer the filename if there is no filename given
    if (!splitPath(targetPath).extension) {
      targetPath = path.join(targetPath, file.name);
    }

    // write server file
    fetch("/writeFile", {
      method: "POST",
      headers: {
        savepath: stripRoot(targetPath),
      },
      body: formData,
    });
  }
  public async rename(pathToFolder: string, newFileName: string) {
    // write server file
    const response = await fetch("/rename", {
      method: "POST",
      headers: {
        renamepath: stripRoot(pathToFolder),
        newfilename: newFileName,
      },
    });

    return response;
  }
  public async delete(pathToFolder: string) {
    // write server file
    const response = await fetch("/delete", {
      method: "POST",
      headers: {
        deletepath: stripRoot(pathToFolder),
      },
    });

    return response;
  }
  public async createFolder(path: string, folder: string) {
    // write server file
    const response = await fetch("/createFolder", {
      method: "POST",
      headers: {
        createpath: stripRoot(path),
        foldername: folder,
      },
    });

    return response;
  }
}
