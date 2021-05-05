/**
 * An implementation of an after effect style number slider editor
 */
import React, { useEffect, useRef, useState } from "react";
import "./NumberSlider.css";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  sensitivity?: number;
  axis?: "x" | "y";
  precision?: number; // correct to certain decimal place
}

export const NumberSlider = ({
  value = 0,
  onChange,
  sensitivity = 0.1,
  axis = "x",
  precision = 3,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(value);

  const [isDragging, setIsDragging] = useState(false);
  const [initialDragValue, setInitialDragValue] = useState(value);

  const [isInputMode, setIsInputMode] = useState(false);
  const [inputValue, setInputValue] = useState(value + "");

  const getRoundedValue = (val) => {
    return round(val, precision);
  };

  // hijack the setvalue function, instead setting state, it propogate the change
  const setValue = (val: number) => {
    onChange && onChange(val);
    setInternalValue(val);
  };
  // make the component still editable without data supplying from the parent component
  value = getRoundedValue(value === null ? internalValue : value);

  /**
   * update value with number format check
   * @param _newVal
   * @returns
   */
  const safelyUpdateValue = (_newVal) => {
    if (isNaN(_newVal)) return;

    const newVal = getRoundedValue(_newVal);
    setValue(newVal);
    // onChange && onChange(newVal);
  };

  const mouseDownHandler = (e: React.MouseEvent) => {
    if (isInputMode) return;
    // begin locking mouse position
    setIsDragging(true);
    setInitialDragValue(value);
    containerRef.current.requestPointerLock();

    document.body.style.userSelect = "none";
  };

  const mouseMoveHandler = (e: React.MouseEvent) => {
    if (isInputMode) return;
    if (!isDragging) return;

    // update the value
    if (axis === "x") {
      const newVal = value + e.movementX * sensitivity;
      safelyUpdateValue(newVal);
    }
    if (axis === "y") {
      const newVal = value + e.movementY * sensitivity;
      safelyUpdateValue(newVal);
    }
  };
  const mouseUpHandler = (e: React.MouseEvent) => {
    if (isInputMode) return;

    // stop locking mouse position
    setIsDragging(false);
    document.exitPointerLock();

    // if the user didn't move the mouse
    // it suggest that the user is clicking the target

    // use internal value rather than value to enable correct functioning of the feature
    // even data is not changed
    if (initialDragValue === internalValue) enterInputMode();

    document.body.style.userSelect = "auto";
  };

  /**
   * Controlling input mode
   */
  const exitInputMode = () => {
    if (!isOnlyNumericSymbols(inputValue + "")) {
      setIsInputMode(false);
      return;
    }

    // evaluate value, make it suppor calculation
    try {
      const evalNumberAmount = eval(inputValue + "");
      if (isValidNumber(evalNumberAmount + "")) {
        // commit the change
        safelyUpdateValue(evalNumberAmount);
      }
    } catch (e) {
      // don't commit the change if the number is not valid
    }
    setIsInputMode(false);
  };

  const enterInputMode = () => {
    setInputValue(value + "");
    setIsInputMode(true);
  };

  const inputFieldValueChange = (e) => {
    const amount = e.target.value;
    setInputValue(amount);
  };

  const inputFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === "Enter") {
      // commit change
      exitInputMode();
    }
    if (e.code === "Escape") {
      // set the value to initial if cancel
      setInputValue(value + "");
      exitInputMode();
    }
    e.stopPropagation();
  };

  const inputFieldBlur = (e: React.FocusEvent) => {
    exitInputMode();
  };

  useEffect(() => {
    if (isInputMode) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isInputMode]);

  return (
    <div
      className="number-slider"
      ref={containerRef}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
      draggable={false}
    >
      <div
        className="number-slider__value"
        style={{ display: isInputMode ? "none" : "block" }}
      >
        {value}
      </div>
      <input
        className="number-slider__value"
        ref={inputRef}
        style={{ display: isInputMode ? "block" : "none" }}
        type="text"
        value={inputValue}
        onChange={inputFieldValueChange}
        onBlur={inputFieldBlur}
        onKeyDown={inputFieldKeyDown}
      />
    </div>
  );
};

function round(value: number, decimals: number) {
  //@ts-ignore
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

//https://www.codegrepper.com/code-examples/javascript/regex+to+check+if+string+contains+only+numbers+and+special+characters+js
function isOnlyNumericSymbols(value: string) {
  // allow white space
  if (value === " ") return true;
  return /([0-9]|[\-+#])+/.test(value);
}

function isValidNumber(value: string) {
  return !isNaN(Number(value));
}
