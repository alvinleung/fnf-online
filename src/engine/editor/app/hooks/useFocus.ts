import { useEffect, useRef, useState } from "react";

/**
 * Hook for ui element focus state
 * @returns [focusRef, isFocused]
 */
export function useFocus(): [any, boolean] {
  const focusRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    const outsideHandler = (e) => {
      if (focusRef.current && !focusRef.current.contains(e.target)) {
        setIsFocused(false);
      } else {
        setIsFocused(true);
      }
    };
    window.addEventListener("click", outsideHandler, { capture: true });
    return () => {
      window.removeEventListener("click", outsideHandler, { capture: true });
    };
  }, [focusRef.current]);

  return [focusRef, isFocused];
}
