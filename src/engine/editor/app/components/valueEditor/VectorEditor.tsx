import React, { FormEvent, useRef, useState } from "react";
import { v3 } from "twgl.js";
import { NumberSlider } from "./NumberSlider";

import "./valueEditor.css";

interface Props {
  name: string;
  value: v3.Vec3;
  onChange?: (value: v3.Vec3) => void;
  onAxisChange?: (value: number, delta: number, axis: number) => void;
}

export const VectorEditor = ({
  name,
  onChange,
  onAxisChange,
  value,
}: Props) => {
  const x = useRef(value[0]);
  const y = useRef(value[1]);
  const z = useRef(value[2]);

  const handleXChange = (val: number) => {
    const delta = val - x.current;
    x.current = val;
    onAxisChange && onAxisChange(val, delta, 0);
    onChange && onChange([val, value[1], value[2]]);
  };

  const handleYChange = (val: number) => {
    const delta = val - y.current;
    y.current = val;
    onAxisChange && onAxisChange(val, delta, 1);
    onChange && onChange([value[0], val, value[2]]);
  };

  const handleZChange = (val: number) => {
    const delta = val - z.current;
    z.current = val;
    onAxisChange && onAxisChange(val, delta, 2);
    onChange && onChange([value[0], value[1], val]);
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
