import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { RgbaColorPicker } from "react-colorful";
import { useHotkeys } from "react-hotkeys-hook";
import { v3 } from "twgl.js";
import useClickOutside from "../../hooks/useClickOutside";
import { HotkeyConfig } from "../../Hotkeys";

interface Props {
  name: string;
  value?: v3.Vec3;
  onChange?: (val: v3.Vec3) => void;
}

export const ColorEditor = ({ name, onChange, value }: Props) => {
  const colorPickerRef = useRef();
  const [internalColor, setInternalColor] = useState(
    value || [200, 150, 35, 0.5]
  );

  const [openingMousePos, setOpeningMousePos] = useState({ x: 0, y: 0 });
  const [colorPickerPos, setColorPickerPos] = useState({ x: 0, y: 0 });
  const [isShowingPicker, setIsShowingPicker] = useState(false);

  const setColor = (val) => {
    const clrArray = [val.r, val.g, val.b, val.a];
    onChange(clrArray);
    setInternalColor(clrArray);
  };
  value = value === null ? value : internalColor;

  useClickOutside(colorPickerRef, () => {
    setIsShowingPicker(false);
  });

  // process the colour picker position to make sure it is on screen
  useEffect(() => {
    const width = 200;
    const height = 200;
    const SCROLL_BAR_OFFSET = 30;
    const xPos =
      openingMousePos.x + width > window.innerWidth - SCROLL_BAR_OFFSET
        ? window.innerWidth - width - SCROLL_BAR_OFFSET
        : openingMousePos.x;
    const yPos =
      openingMousePos.y + height > window.innerHeight - SCROLL_BAR_OFFSET
        ? window.innerHeight - height - SCROLL_BAR_OFFSET
        : openingMousePos.y;
    setColorPickerPos({
      x: xPos,
      y: yPos,
    });
  }, [openingMousePos]);

  const showColorPicker = () => {
    setIsShowingPicker(true);
  };
  const hideColorPicker = () => {
    setIsShowingPicker(false);
  };

  const handleColorSwatchClick = (e: React.MouseEvent) => {
    setOpeningMousePos({ x: e.clientX, y: e.clientY });
    showColorPicker();
  };

  useHotkeys(HotkeyConfig.ESCAPE, () => {
    // escaping
    hideColorPicker();
  });

  return (
    <div className="value-editor" ref={colorPickerRef}>
      <label className="value-editor__field">
        <div className="value-editor__label">{name}</div>
        {/* Colour popup */}
        <motion.div
          style={{
            display: isShowingPicker ? "block" : "none",
            position: "fixed",
            top: colorPickerPos.y,
            left: colorPickerPos.x,
            backgroundColor: "var(--clr-bg-lighter)",
            padding: "var(--spacing-xs)",
            zIndex: 1000000,
          }}
        >
          <RgbaColorPicker
            color={{ r: value[0], g: value[1], b: value[2], a: value[3] }}
            onChange={setColor}
          />
        </motion.div>
        <div
          style={{
            cursor: "pointer",
            backgroundColor: `rgba(${value[0]}, ${value[1]}, ${value[2]}, ${value[3]})`,
          }}
          onClick={handleColorSwatchClick}
        ></div>
      </label>
    </div>
  );
};
