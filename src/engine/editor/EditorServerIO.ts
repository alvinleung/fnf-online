import { splitPath } from "../utils/StringUtils";

const EDITOR_ENV = true;

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
  public async writeFile(path: string, file: File) {
    if (!EDITOR_ENV) {
      console.warn(`Aborting: Writing only available when running on editor server.`);
      return;
    }
    const formData = new FormData();
    formData.append("fileUploadField", file);

    // infer the filename if there is no filename given
    if (!splitPath(path).filename) {
      path.concat(file.name);
    }

    // write server file
    fetch("/writeFile", {
      method: "POST",
      headers: {
        savepath: path,
      },
      body: formData,
    });
  }
}
