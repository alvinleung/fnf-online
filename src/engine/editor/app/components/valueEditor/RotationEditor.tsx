/**
 * editor for quaternion
 */
import React from "react";
import { v3 } from "twgl.js";
import { VectorEditor } from "./VectorEditor";
import * as q from "../../../../utils/quaternion";

interface Props {
  initialValue: v3.Vec3;
  name?: string;
  onChange?: (quat: q.Quat) => void;
}

export const RotationEditor = ({ initialValue, name, onChange }: Props) => {
  const handleChange = (val: v3.Vec3) => {
    // convert the vector rotation into quaternion
    const quaternion = q.fromEulerAngles(val[0], val[1], val[2]);
    onChange && onChange(quaternion);
  };

  return (
    <VectorEditor
      name={name}
      initialValue={initialValue}
      onChange={handleChange}
    />
  );
};
