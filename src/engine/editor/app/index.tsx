import React from "react";
import ReactDOM from "react-dom";
import { Game } from "../../Game";
import App from "./App";
import { EditHistoryContextWrapper } from "./EditHistory";

/**
 * Begin point of the level editor react app
 */
function initEditor(wrapper, gameInstance: Game) {
  const app = (
    <EditHistoryContextWrapper game={gameInstance}>
      <App game={gameInstance} />
    </EditHistoryContextWrapper>
  );
  ReactDOM.render(app, wrapper);
}

export { initEditor };
