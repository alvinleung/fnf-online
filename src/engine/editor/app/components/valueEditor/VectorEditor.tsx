import React, { FormEvent, useState } from "react";
import { v3 } from "twgl.js";
import { NumberSlider } from "./NumberSlider";

import "./valueEditor.css";

interface Props {
  name: string;
  initialValue: v3.Vec3;
  onChange?: (value: v3.Vec3) => void;
}

export const VectorEditor = ({ name, onChange, initialValue }: Props) => {
  const [x, setX] = useState(initialValue[0]);
  const [y, setY] = useState(initialValue[1]);
  const [z, setZ] = useState(initialValue[2]);

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
          <NumberSlider
            onChange={handleXChange}
            initialValue={initialValue[0]}
          />
        </label>
        <label className="value-editor__field">
          <div className="value-editor__label">y</div>
          <NumberSlider
            onChange={handleYChange}
            initialValue={initialValue[1]}
          />
        </label>
        <label className="value-editor__field">
          <div className="value-editor__label">z</div>
          <NumberSlider
            onChange={handleZChange}
            initialValue={initialValue[2]}
          />
        </label>
      </div>
    </div>
  );
};
