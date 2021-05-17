const express = require("express");
const fileUpload = require("express-fileupload");
const http = require("http");
const path = require("path");
const reload = require("reload");

const ASSET_SHEET_PUBLIC_ACCESS = "/asset-sheet";
const ASSET_SHEET_PATH = "/src/AssetSheet.json";

const ASSET_PUBLIC_ACCESS = "/assets/";
const ASSET_FOLDER_PATH = "./assets/";

const app = express();
const publicDir = path.join(__dirname, "./dist");

const fs = require("fs");

// clear console when restart app
clearConsole();

app.set("port", process.env.PORT || 3000);
app.use("/", express.static("dist"));
app.use("/assets", express.static("assets"));
app.use("/src", express.static("src")); // for source map support

// handle file upload
app.use(
  "/writeFile",
  fileUpload({
    preserveExtension: true,
    safeFileNames: true,
  })
);

// prevent favicon request from browser
app.get("/favicon.ico", (req, res) => {
  res.status(204);
  res.end();
});

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "/index.html"));
});

app.get(ASSET_SHEET_PUBLIC_ACCESS, (req, res) => {
  console.log(`${getTimeNow()} Client request asset`);
  res.sendFile(path.join(__dirname, ASSET_SHEET_PATH));
});

/**
 * Headers Config
 * -------------------------------------
 * savePath - the path of the file
 */
app.post("/writeFile", (req, res) => {
  const savePath = req.headers.savepath;
  const BASE_PATH = ASSET_FOLDER_PATH;
  const combinedPath = path.join(BASE_PATH, savePath);

  console.log(`Writing file: ${combinedPath}`);

  const { dirname } = splitPath(combinedPath);
  if (!fs.existsSync(dirname)) {
    // recursively create the file path if the file path doesn't exi
    fs.mkdirSync(dirname, { recursive: true });
  }

  // move the file to the target directory
  req.files.fileUploadField.mv(combinedPath);

  res.status(200);
  res.end();
});

app.get("/listFolder", (req, res) => {
  const listPath = req.headers.listpath;
  const combinedPath = path.join(__dirname, ASSET_FOLDER_PATH, listPath);

  const dir = fs.readdirSync(combinedPath);

  // filter hidden file in the system
  const filteredDir = dir.filter((item) => !/(^|\/)\.[^/.]/g.test(item));

  res.json(filteredDir);
});

app.get("/listAllFolders", async (req, res) => {
  const combinedPath = path.join(__dirname, ASSET_FOLDER_PATH);
  // return a json map of folders
  const files = await getFiles(combinedPath);

  // trim the base path
  const relPaths = files.map((file) => {
    return path.relative(__dirname, file);
  });

  res.json(relPaths);
});

const server = http.createServer(app);

const serverListen = () => {
  const serverURL = `http://localhost:${app.get("port")}`;

  const log = console.log;

  log(`Editor server started on ${serverURL}`);
  log(`----------------------------------------------------------`);
  log(`Asset sheet public url  ${serverURL + ASSET_SHEET_PUBLIC_ACCESS}`);
  log(`Asset sheet source      ${ASSET_SHEET_PATH}`);
  log(`Asset source folder     ${ASSET_FOLDER_PATH}`);
  log(`Asset public base url   ${serverURL + ASSET_PUBLIC_ACCESS}`);
  log(``);
  log(``);
};

// Reload code here
reload(app)
  .then(function (reloadReturned) {
    // Reload started, start web server
    server.listen(app.get("port"), serverListen);
  })
  .catch(function (err) {
    console.error(
      "Reload could not start, could not start server/sample app",
      err
    );
  });

function getTimeNow() {
  return new Date().toISOString().match(/(\d{2}:){2}\d{2}/)[0];
}

function clearConsole() {
  console.log("\033[2J");
}

/**
 * The ultimate split path.
 * Extracts dirname, filename, extension, and trailing URL params.
 * Correct handles:
 *   empty dirname,
 *   empty extension,
 *   random input (extracts as filename),
 *   multiple extensions (only extracts the last one),
 *   dotfiles (however, will extract extension if there is one)
 * @param  {string} path
 * @return {Object} Object containing fields "dirname", "filename", "extension", and "params"
 */
function splitPath(path) {
  var result = path
    .replace(/\\/g, "/")
    .match(/(.*\/)?(\..*?|.*?)(\.[^.]*?)?(#.*$|\?.*$|$)/);
  return {
    dirname: result[1] || "",
    filename: result[2] || "",
    extension: result[3] || "",
    params: result[4] || "",
  };
}

//https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
async function getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.reduce((arr, dirent) => {
      const res = path.resolve(dir, dirent.name);

      // search folder
      if (dirent.isDirectory()) {
        arr.push(getFiles(res));
      }

      // ignore system files
      if (!isSystemFile(res)) arr.push(res);

      return arr;
    }, [])
  );
  return Array.prototype.concat(...files);
}

function isSystemFile(file) {
  return /(^|\/)\.[^/.]/g.test(file);
}