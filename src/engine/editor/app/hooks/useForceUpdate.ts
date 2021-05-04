import React from "react";

export default function useForceUpdate(): () => void {
  return React.useReducer(() => ({}), {})[1] as () => void; // <- paste here
}
