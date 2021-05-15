import React from "react";
import "./main.css";
import MyGame from "./MyGame";
import { initEditor } from "./engine/editor/app";

const game = new MyGame();
document.querySelector("#game").appendChild(game.getCanvas());

if (window.location.hash !== "#no-editor") initEditor(document.querySelector("#editor-ui"), game);

//@ts-ignore
window.game = game; // for debug, make game accessable
