/**
 * editor for quaternion
 */
import React, { useEffect, useRef, useState } from "react";
import { m4, v3 } from "twgl.js";
import { VectorEditor } from "./VectorEditor";
import * as q from "../../../../utils/quaternion";
import { DEFAULT_SENSITIVITY } from "./NumberSlider";

interface Props {
  value: v3.Vec3;
  name?: string;
  onChange?: (quat: v3.Vec3) => void;
  displayUnit?: "radian" | "degree";
  sensitivity?: number;
  stepSize?: number; // in radian
}

export const RotationEditor = ({
  value,
  name,
  onChange,
  displayUnit = "degree",
  sensitivity = DEFAULT_SENSITIVITY,
  stepSize = degToRad(10), // in radian
}: Props) => {
  let eulerRot2: v3.Vec3 = q.quatToAngleAxis(value);

  const convertedUnit = displayUnit === "degree" ? radToDegVec3(value) : value;

  const handleChange = (changedVal: v3.Vec3) => {
    const convertedUnit =
      displayUnit === "degree" ? degToRadVec3(changedVal) : changedVal;
    onChange && onChange(convertedUnit);
  };

  return (
    <VectorEditor
      name={name}
      value={convertedUnit}
      onChange={handleChange}
      sensitivity={
        displayUnit === "degree" ? radToDeg(sensitivity) : sensitivity
      }
      stepSize={displayUnit === "degree" ? radToDeg(stepSize) : stepSize}
    />
  );
};

function radToDeg(v: number): number {
  return (v * 180) / Math.PI;
}
function degToRad(v: number): number {
  return (v * Math.PI) / 180;
}

function radToDegVec3(vec: v3.Vec3) {
  return vec.map((v) => {
    return (v * 180) / Math.PI;
  });
}

function degToRadVec3(vec: v3.Vec3) {
  return vec.map((v) => {
    return (v * Math.PI) / 180;
  });
}
