import React, { FormEvent, useState } from "react";
import { v3 } from "twgl.js";
import { NumberSlider } from "./NumberSlider";

import "./valueEditor.css";

interface Props {
  name: string;
  value: v3.Vec3;
  onChange?: (value: v3.Vec3) => void;
}

export const VectorEditor = ({ name, onChange, value }: Props) => {
  const [x, setX] = useState(value[0]);
  const [y, setY] = useState(value[1]);
  const [z, setZ] = useState(value[2]);

  const handleXChange = (val: number) => {
    setX(val);
    onChange && onChange([val, y, z]);
  };
  const handleYChange = (val: number) => {
    setY(val);
    onChange && onChange([x, val, z]);
  };
  const handleZChange = (val: number) => {
    setZ(val);
    onChange && onChange([x, y, val]);
  };

  return (
    <div className="value-editor">
      <div className="value-editor__group-name">{name}</div>
      <div className="value-editor__group-container">
        <label className="value-editor__field">
          <div className="value-editor__label">x</div>
          <NumberSlider onChange={handleXChange} value={value[0]} />
        </label>
        <label className="value-editor__field">
          <div className="value-editor__label">y</div>
          <NumberSlider onChange={handleYChange} value={value[1]} />
        </label>
        <label className="value-editor__field">
          <div className="value-editor__label">z</div>
          <NumberSlider onChange={handleZChange} value={value[2]} />
        </label>
      </div>
    </div>
  );
};
