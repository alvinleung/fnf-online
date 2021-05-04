import React, { useState } from "react";
import { NumberSlider } from "./NumberSlider";

interface Props {
  name: string;
  initialValue?: number;
  onChange?: (val: number) => void;
}

export const NumberEditor = ({ onChange, name, initialValue }: Props) => {
  const handleChange = (val: number) => {
    onChange && onChange(val);
  };

  return (
    <div className="value-editor">
      <div className="value-editor__group-container">
        <label className="value-editor__field">
          <div className="value-editor__label">{name}</div>
          <NumberSlider initialValue={initialValue} onChange={handleChange} />
        </label>
      </div>
    </div>
  );
};
