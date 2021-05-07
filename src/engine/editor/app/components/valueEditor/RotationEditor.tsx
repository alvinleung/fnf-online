/**
 * editor for quaternion
 */
import React, { useEffect, useRef, useState } from "react";
import { m4, v3 } from "twgl.js";
import { VectorEditor } from "./VectorEditor";
import * as q from "../../../../utils/quaternion";

interface Props {
  value: v3.Vec3;
  name?: string;
  onChange?: (quat: v3.Vec3) => void;
}

export const RotationEditor = ({ value, name, onChange }: Props) => {
  let eulerRot2: v3.Vec3 = q.quatToAngleAxis(value);

  const handleChange = (val: v3.Vec3) => {
    onChange && onChange(val);
  };

  return <VectorEditor name={name} value={value} onChange={handleChange} />;
};
