import React from "react";
import { RotationEditor } from "./RotationEditor";
import { VectorEditor } from "./VectorEditor";
import { Editor } from "../../../EditorDecorators";
import { BooleanEditor } from "./BooleanEditor";
import { camelCaseToSentenceCase } from "../../../../utils/StringUtils";
import { NumberEditor } from "./NumberEditor";
import { InstanceEditor } from "./InstanceEditor";
import { ResourceEditor } from "./ResourceEditor";

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
  const formattedName = camelCaseToSentenceCase(fieldName);

  if (fieldType === Editor.VECTOR)
    return (
      <VectorEditor name={formattedName} value={value} onChange={onChange} />
    );

  if (fieldType === Editor.ROTATION)
    return (
      <RotationEditor name={formattedName} value={value} onChange={onChange} />
    );
  if (fieldType === Editor.BOOLEAN)
    return (
      <BooleanEditor name={formattedName} value={value} onChange={onChange} />
    );

  if (fieldType === Editor.NUMBER)
    return (
      <NumberEditor name={formattedName} value={value} onChange={onChange} />
    );

  if (fieldType === Editor.INSTANCE)
    return (
      <InstanceEditor name={formattedName} value={value} onChange={onChange} />
    );
  if (fieldType === Editor.RESOURCE_IMAGE)
    return (
      <ResourceEditor name={formattedName} value={value} onChange={onChange} />
    );

  return <div>"{formattedName}" not supported yet</div>;
};
