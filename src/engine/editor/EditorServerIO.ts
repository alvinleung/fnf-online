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

  public async writeFile(path: string, file: any) {
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
    const response = await fetch("/writeFile", {
      method: "POST",
      headers: {
        savepath: path,
      },
      body: formData,
    });
    console.log(response.json());
  }
}
