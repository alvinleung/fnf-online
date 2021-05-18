import { useRef } from "react";

export default function hasPropChanged(prop) {
  const pastValue = useRef(prop);
  let _hasPropChanged = false;
  if (pastValue.current !== prop) {
    pastValue.current = prop;
    _hasPropChanged = true;
  }

  return _hasPropChanged;
}
