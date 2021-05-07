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
  unitSetting: "radian" | "degree";
  sensitivity: number;
}

export const RotationEditor = ({
  value,
  name,
  onChange,
  unitSetting = "degree",
  sensitivity = DEFAULT_SENSITIVITY,
}: Props) => {
  let eulerRot2: v3.Vec3 = q.quatToAngleAxis(value);

  const convertedUnit = unitSetting === "degree" ? radToDegVec3(value) : value;

  const handleChange = (changedVal: v3.Vec3) => {
    const convertedUnit =
      unitSetting === "degree" ? degToRadVec3(changedVal) : changedVal;
    onChange && onChange(convertedUnit);
  };

  return (
    <VectorEditor
      name={name}
      value={convertedUnit}
      onChange={handleChange}
      sensitivity={
        unitSetting === "degree" ? radToDeg(sensitivity) : sensitivity
      }
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
