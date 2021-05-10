import React from "react";

const useClickOutside = (ref, callback, mouseDown = false) => {
  const handleClick = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      callback();
    }
  };
  React.useEffect(() => {
    document.addEventListener(mouseDown ? "mousedown" : "click", handleClick);
    return () => {
      document.removeEventListener(
        mouseDown ? "mousedown" : "click",
        handleClick
      );
    };
  });
};

export default useClickOutside;
