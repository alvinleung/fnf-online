import React from "react";
import { RotationEditor } from "./RotationEditor";
import { VectorEditor } from "./VectorEditor";
import { Editor } from "../../../EditorDecorators";

interface Props {
  fieldType: number;
  fieldName: string;
  value: any;
}

export const ValueEditor = ({ fieldName, fieldType, value }: Props) => {
  return <div>{getEditorByType(fieldName, fieldType, value)}</div>;
};

function getEditorByType(fieldName: string, fieldType: number, value: any) {
  if (fieldType === Editor.VECTOR)
    return <VectorEditor name={fieldName} value={value} />;

  if (fieldType === Editor.QUATERNION)
    return <RotationEditor name={fieldName} value={value} />;

  return <div>{fieldName} not supported yet</div>;
}
