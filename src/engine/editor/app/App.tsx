import React from "react";
import "./App.css";
import "./style/typography.css";
import "./style/layout.css";
import "./style/variables.css";
import { Panel } from "./components/Panel";
import { List } from "./components/List";
import { ListItem } from "./components/ListItem";
import { EntityInspectorHead } from "./components/EntityInspectorHead";
import { CollapsableSection } from "./components/CollapsableSection";
import { VectorEditor } from "./components/valueEditor/VectorEditor";
import { v3 } from "twgl.js";
import { BooleanEditor } from "./components/valueEditor/BooleanEditor";
import { RotationEditor } from "./components/valueEditor/RotationEditor";
import { NumberEditor } from "./components/valueEditor/NumberEditor";

const App = () => {
  return (
    <>
      <Panel header="Entity List" dockingSide="left" minSize={150}>
        <List>
          <ListItem value="test">test</ListItem>
          <ListItem value="test2">test2</ListItem>
        </List>
      </Panel>
      <Panel dockingSide="right">
        <EntityInspectorHead selectedEntity="EntityName" />
        <CollapsableSection header="Component Name">
          <VectorEditor name="Position" initialValue={[9, 9, 2]} />
          <VectorEditor name="Scale" initialValue={[9, 9, 2]} />
          <RotationEditor name="Rotation" initialValue={[9, 9, 2]} />
          <NumberEditor name="23455" initialValue={2} />
          <BooleanEditor name="test" initialValue={false} />
        </CollapsableSection>
        <CollapsableSection header="Renderable Component">
          <BooleanEditor name="Enable" initialValue={false} />
        </CollapsableSection>
      </Panel>
    </>
  );
};

export default App;
