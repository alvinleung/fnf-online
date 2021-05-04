import React from "react";
import "./EntityInspectorHead.css";

interface Props {
  selectedEntity?: string;
}

export const EntityInspectorHead = ({ selectedEntity }: Props) => {
  return (
    <div className="entity-inspector-head">
      {selectedEntity && (
        <>
          <div className="header-label panel-hor-spacing">Selceted</div>
          <div className="entity-inspector-head__entity-name panel-hor-spacing">
            {selectedEntity}
          </div>
        </>
      )}
    </div>
  );
};
