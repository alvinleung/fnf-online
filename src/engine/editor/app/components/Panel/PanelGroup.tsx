import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";
import { PanelResizableContainer } from ".";

interface Props {
  children: React.ReactElement[];
}

export const PanelGroup = ({ children }: Props) => {
  let leftPanel: React.ReactElement = { props: {}, key: null, type: null };
  let rightPanel: React.ReactElement = { props: {}, key: null, type: null };
  children.forEach((panel) => {
    if (panel.props.dockingSide === "left") leftPanel = panel;
    if (panel.props.dockingSide === "right") rightPanel = panel;
  });

  const leftPanelInitialCollapse = leftPanel.props.initialState === "collapsed";
  const rightPanelInitialCollapse = rightPanel.props.initialState === "collapsed";

  const [shouldAllPanelCollapse, setShouldAllPanelsCollapse] = useState(null);
  const [shouldLeftPanelCollapse, setShouldLeftPanelCollapse] = useState(leftPanelInitialCollapse);
  const [shouldRightPanelCollapse, setShouldRightPanelCollapse] =
    useState(rightPanelInitialCollapse);
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
    if (shouldAllPanelCollapse === null) return;
    setShouldLeftPanelCollapse(shouldAllPanelCollapse);
    setShouldRightPanelCollapse(shouldAllPanelCollapse);
  }, [shouldAllPanelCollapse]);

  useHotkeys(
    HotkeyConfig.HIDE_UI,
    () => {
      if (shouldAllPanelCollapse === null) {
        // not initialised
        // console.log(!leftPanelInitialCollapse);
        setShouldAllPanelsCollapse(leftPanelInitialCollapse);
      }
      setShouldAllPanelsCollapse(!shouldAllPanelCollapse);
    },
    [shouldAllPanelCollapse, leftPanelInitialCollapse]
  );

  return (
    <>
      <PanelResizableContainer
        dockingSide="left"
        {...leftPanel.props}
        onCollapseStateChange={collapseStateChange}
        shouldCollapse={shouldLeftPanelCollapse}
      >
        {leftPanel}
      </PanelResizableContainer>
      <PanelResizableContainer
        dockingSide="right"
        {...rightPanel.props}
        onCollapseStateChange={collapseStateChange}
        shouldCollapse={shouldRightPanelCollapse}
      >
        {rightPanel}
      </PanelResizableContainer>
    </>
  );
};
