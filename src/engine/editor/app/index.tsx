import React from "react";
import ReactDOM from "react-dom";
import { Game } from "../../Game";
import App from "./App";
/**
 * Begin point of the level editor react app
 */
function initEditor(wrapper, gameInstance: Game) {
  const app = <App game={gameInstance} />;
  ReactDOM.render(app, wrapper);
}

export { initEditor };
