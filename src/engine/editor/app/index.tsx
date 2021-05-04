import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
/**
 * Begin point of the level editor react app
 */
function initEditor(wrapper) {
  const app = <App></App>;
  ReactDOM.render(app, wrapper);
}

export { initEditor };
