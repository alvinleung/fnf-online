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
  const handleXChange = (val: number) => {
    onChange && onChange([val, value[1], value[2]]);
  };

  const handleYChange = (val: number) => {
    onChange && onChange([value[0], val, value[2]]);
  };

  const handleZChange = (val: number) => {
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
