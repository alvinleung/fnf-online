const express = require("express");
const http = require("http");
const path = require("path");
const reload = require("reload");

const ASSET_SHEET_PUBLIC_ACCESS = "/asset-sheet";
const ASSET_SHEET_PATH = "/src/AssetSheet.json";

const ASSET_PUBLIC_ACCESS = "/assets/";
const ASSET_FOLDER_PATH = "/assets/";

const app = express();
const publicDir = path.join(__dirname, "./dist");

// clear console when restart app
clearConsole();

app.set("port", process.env.PORT || 3000);
app.use("/", express.static("dist"));
app.use("/assets", express.static("assets"));

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
