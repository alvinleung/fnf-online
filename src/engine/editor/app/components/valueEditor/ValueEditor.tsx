import React from "react";
import { RotationEditor } from "./RotationEditor";
import { VectorEditor } from "./VectorEditor";
import { Editor } from "../../../EditorDecorators";
import { BooleanEditor } from "./BooleanEditor";

interface Props {
  fieldType: number;
  fieldName: string;
  value: any;
  onChange: any;
}

export const ValueEditor = ({
  fieldName,
  fieldType,
  value,
  onChange,
}: Props) => {
  return <div>{getEditorByType(fieldName, fieldType, value, onChange)}</div>;
};

function getEditorByType(
  fieldName: string,
  fieldType: number,
  value: any,
  onChange: (val: any) => {}
) {
  if (fieldType === Editor.VECTOR)
    return <VectorEditor name={fieldName} value={value} onChange={onChange} />;

  if (fieldType === Editor.QUATERNION)
    return (
      <RotationEditor name={fieldName} value={value} onChange={onChange} />
    );
  if (fieldType === Editor.BOOLEAN)
    return <BooleanEditor name={fieldName} value={value} onChange={onChange} />;

  return <div>{fieldName} not supported yet</div>;
}
