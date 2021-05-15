import React from "react";

const useClickOutside = (ref, callback, mouseDown = false) => {
  const handleClick = (e) => {
    if (ref && ref instanceof Array) {
      const isClickingInsideAnyRef = ref.some((elm) => {
        if (elm instanceof HTMLElement) return elm.contains(e.target);
        return elm.current.contains(e.target);
      });

      if (!isClickingInsideAnyRef) callback();
    }
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };

  React.useEffect(() => {
    document.addEventListener(mouseDown ? "mousedown" : "click", handleClick);
    return () => {
      document.removeEventListener(mouseDown ? "mousedown" : "click", handleClick);
    };
  });
};

export default useClickOutside;
