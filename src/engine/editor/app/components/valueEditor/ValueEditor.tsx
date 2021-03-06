import React from "react";
import { RotationEditor } from "./RotationEditor";
import { VectorEditor } from "./VectorEditor";
import { Editor } from "../../../EditorDecorators";
import { BooleanEditor } from "./BooleanEditor";
import { camelCaseToSentenceCase } from "../../../../utils/StringUtils";
import { NumberEditor } from "./NumberEditor";
import { ImageResourceEditor } from "./ImageResourceEditor";
import { ColorEditor } from "./ColorEditor";
import { InstantiableClassEditor } from "./InstantiableClassEditor";
import { ObjectEditor } from "./ObjectEditor";
import hasPropChanged from "../../hooks/hasPropChanged";

interface Props {
  fieldType: string;
  fieldName: string;
  value: any;
  onChange: any;
  config?: Object;
}

export const ValueEditor = React.memo(
  ({ fieldName, fieldType, value, onChange, config }: Props) => {
    const formattedName = camelCaseToSentenceCase(fieldName);

    /**
     * Stateless editor components
     */

    if (fieldType === Editor.VECTOR)
      return <VectorEditor name={formattedName} value={value} onChange={onChange} />;

    if (fieldType === Editor.ROTATION)
      return <RotationEditor name={formattedName} value={value} onChange={onChange} />;

    if (fieldType === Editor.BOOLEAN)
      return <BooleanEditor name={formattedName} value={value} onChange={onChange} />;

    if (fieldType === Editor.NUMBER)
      return <NumberEditor name={formattedName} value={value} onChange={onChange} />;

    if (fieldType === Editor.INTEGER)
      return (
        <NumberEditor
          name={formattedName}
          value={value}
          onChange={onChange}
          stepMode={true}
          stepSize={1}
        />
      );

    /**
     * Stateful editor components (depends on different entity)
     */

    if (fieldType === Editor.CLASS)
      return (
        <InstantiableClassEditor
          name={formattedName}
          value={value}
          onChange={onChange}
          config={config}
        />
      );

    if (fieldType === Editor.OBJECT)
      return (
        <ObjectEditor name={formattedName} value={value} onChange={onChange} config={config} />
      );

    if (fieldType === Editor.RGBA)
      return <ColorEditor name={formattedName} value={value} onChange={onChange} />;

    if (fieldType === Editor.RESOURCE_IMAGE)
      return <ImageResourceEditor name={formattedName} value={value} onChange={onChange} />;

    return <div className="inspector-text">"{formattedName}" not supported yet</div>;
  }
);
