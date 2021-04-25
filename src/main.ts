import * as THREE from "three";
import "./main.css";
import MyGame from "./MyGame";

const game = new MyGame();
document.body.appendChild(game.getCanvas());
