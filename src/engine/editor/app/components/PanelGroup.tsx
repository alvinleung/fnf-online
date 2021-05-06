import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../Hotkeys";
import { PanelResizableContainer } from "./Panel";

interface Props {
  children: React.ReactElement[];
}

export const PanelGroup = ({ children }: Props) => {
  const [shouldAllPanelCollapse, setShouldAllPanelsCollapse] = useState(true);
  const [shouldLeftPanelCollapse, setShouldLeftPanelCollapse] = useState(true);
  const [shouldRightPanelCollapse, setShouldRightPanelCollapse] = useState(
    true
  );
  const collapseStateChange = (collapse: boolean, side: string) => {
    if (side === "left") setShouldLeftPanelCollapse(collapse);
    if (side === "right") setShouldRightPanelCollapse(collapse);

    // if both side are at the same state, update the general state
    if (
      (side === "left" && collapse === shouldRightPanelCollapse) ||
      (side === "right" && collapse === shouldLeftPanelCollapse)
    )
      setShouldAllPanelsCollapse(collapse);

    return collapse;
  };

  useEffect(() => {
    setShouldLeftPanelCollapse(shouldAllPanelCollapse);
    setShouldRightPanelCollapse(shouldAllPanelCollapse);
  }, [shouldAllPanelCollapse]);

  useHotkeys(
    HotkeyConfig.HIDE_UI,
    () => {
      setShouldAllPanelsCollapse(!shouldAllPanelCollapse);
    },
    [shouldAllPanelCollapse]
  );

  let leftPanel, rightPanel;

  children.forEach((panel) => {
    if (panel.props.dockingSide === "left") leftPanel = panel;
    if (panel.props.dockingSide === "right") rightPanel = panel;
  });

  return (
    <>
      <PanelResizableContainer
        header="Entity List"
        dockingSide="left"
        minSize={150}
        initialState="collapsed"
        onCollapseStateChange={collapseStateChange}
        shouldCollapse={shouldLeftPanelCollapse}
      >
        {leftPanel}
      </PanelResizableContainer>
      <PanelResizableContainer
        dockingSide="right"
        initialState="collapsed"
        minSize={250}
        onCollapseStateChange={collapseStateChange}
        shouldCollapse={shouldRightPanelCollapse}
      >
        {rightPanel}
      </PanelResizableContainer>
    </>
  );
};
