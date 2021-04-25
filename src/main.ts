import * as THREE from "three";
import "./main.css";
import initGame from "./engine/Game";

const canvasElm = initGame();
document.body.appendChild(canvasElm);
