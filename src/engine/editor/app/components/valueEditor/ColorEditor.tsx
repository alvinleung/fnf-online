import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { RgbaColorPicker } from "react-colorful";

interface Props {
  name: string;
  initialValue?: { r: number; g: number; b: number; a: number };
  onChange?: ({ r, g, b, a }) => void;
}

export const ColorEditor = ({ name, onChange, initialValue }: Props) => {
  const [color, setColor] = useState(
    initialValue || { r: 200, g: 150, b: 35, a: 0.5 }
  );

  useEffect(() => {
    // when color change
    onChange && onChange(color);
  }, [color]);

  return (
    <div className="value-editor">
      <label className="value-editor__field">
        <div className="value-editor__label">{name}</div>
        <RgbaColorPicker color={color} onChange={setColor} />
      </label>
    </div>
  );
};
