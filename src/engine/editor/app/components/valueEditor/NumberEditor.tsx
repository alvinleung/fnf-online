import React, { useState } from "react";
import { NumberSlider } from "./NumberSlider";

interface Props {
  name: string;
  value?: number;
  onChange?: (val: number) => void;
  stepMode?: boolean;
  stepSize?: number;
}

export const NumberEditor = ({
  onChange,
  name,
  value,
  stepMode,
  stepSize,
}: Props) => {
  const handleChange = (val: number) => {
    onChange && onChange(val);
  };

  return (
    <div className="value-editor">
      <div className="value-editor__group-container">
        <label className="value-editor__field">
          <div className="value-editor__label">{name}</div>
          <NumberSlider
            value={value}
            onChange={handleChange}
            stepMode={stepMode}
            stepSize={stepSize}
          />
        </label>
      </div>
    </div>
  );
};
