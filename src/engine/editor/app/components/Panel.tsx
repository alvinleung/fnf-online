import { motion, useAnimation, useMotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { config } from "../AnimationConfig";
import { HotkeyConfig } from "../Hotkeys";
import "./Panel.css";

const ARROW_RIGHT = require("url:../images/arrow-right-nav.svg");
const ARROW_DOWN = require("url:../images/arrow-down-nav.svg");
const ARROW_LEFT = require("url:../images/arrow-left-nav.svg");
const ARROW_UP = require("url:../images/arrow-up-nav.svg");

interface Props {
  children?: React.ReactNode;
  header?: string;
  dockingSide: "left" | "right" | "bottom" | "top";
  minSize?: number;
  initialState?: "collapsed" | "expanded";
}

export const Panel = ({
  children,
  header,
  dockingSide,
  initialState,
  minSize = 200,
}: Props) => {
  const [collapsed, setColapsed] = useState(initialState === "collapsed");
  const [panelSize, setPanelSize] = useState(collapsed ? 0 : minSize);
  const [isDragging, setIsDragging] = useState(false);

  const panelHandleAnimator = useAnimation();
  const panelSizeAnimator = useAnimation();
  useEffect(() => {
    panelSizeAnimator.set({
      width: panelSize,
    });
  }, []); // set initial panel animator state base on panel size

  const resizableX =
    dockingSide === "left" || dockingSide === "right" ? true : false;
  const resizableY =
    dockingSide === "bottom" || dockingSide === "top" ? true : false;

  function onDragStart() {
    panelSizeAnimator.set(getHandleBorderStyle());
    setIsDragging(true);
  }
  function onDragEnd() {
    panelSizeAnimator.set({ borderRight: "none", borderLeft: "none" });
    setIsDragging(false);
  }

  function getHandleBorderStyle() {
    const handleBorderSize = ".25rem";
    switch (dockingSide) {
      case "left":
        return { borderRight: `${handleBorderSize} solid var(--clr-accent)` };
      case "right":
        return { borderLeft: `${handleBorderSize} solid var(--clr-accent)` };
    }
  }

  function onDrag(event: DragEvent, info) {
    const mouseX = info.point.x;
    const mouseY = info.point.y;
    switch (dockingSide) {
      case "left":
        if (mouseX < minSize) {
          setColapsed(true);
          panelSizeAnimator.start({
            width: 0,
          });
        } else {
          setColapsed(false);
          panelSizeAnimator.start({
            width: mouseX,
          });
        }
        setPanelSize(mouseX);
        break;
      case "right":
        if (window.innerWidth - mouseX < minSize) {
          setColapsed(true);
          panelSizeAnimator.start({
            width: 0,
          });
        } else {
          setColapsed(false);
          panelSizeAnimator.start({
            width: window.innerWidth - mouseX,
          });
        }
        setPanelSize(window.innerWidth - mouseX);
        break;
      case "top":
        if (mouseY < minSize) {
          setColapsed(true);
        } else {
          setColapsed(false);
        }
        setPanelSize(mouseY);
        break;
      case "bottom":
        if (window.innerHeight - mouseY < minSize) {
          setColapsed(true);
        } else {
          setColapsed(false);
        }
        setPanelSize(window.innerHeight - mouseY);
        break;
    }
  }

  useEffect(() => {
    if (isDragging) return;

    if (!collapsed) {
      console.log(collapsed);
      switch (dockingSide) {
        case "left":
          panelHandleAnimator.start({
            x: panelSize,
          });
          break;
        case "right":
          panelHandleAnimator.start({
            x: -panelSize,
          });
          break;
      }
      return;
    }

    // when collapsed
    panelHandleAnimator.start({
      x: 0,
    });
  }, [collapsed, isDragging]);

  const openPanel = () => {
    panelSizeAnimator.start({
      width: minSize,
    });
    panelHandleAnimator.start({
      x: dockingSide === "right" ? -minSize : minSize,
    });
    setPanelSize(minSize);
    setColapsed(false);
  };
  const closePanel = () => {
    panelSizeAnimator.start({
      width: 0,
    });
    panelHandleAnimator.start({
      x: 0,
    });
    setPanelSize(0);
    setColapsed(true);
  };

  const getArrow = (dockingSide) => {
    if (dockingSide === "left") return ARROW_RIGHT;
    if (dockingSide === "right") return ARROW_LEFT;
    if (dockingSide === "top") return ARROW_DOWN;
    if (dockingSide === "bottom") return ARROW_UP;
  };

  const getPanelButtonPos = (collapsed, dockingSide) => {
    const offset = 40;
    if (dockingSide === "left")
      return {
        left: collapsed ? 0 : -offset,
      };
    if (dockingSide === "right")
      return {
        right: collapsed ? 0 : -offset,
      };
    if (dockingSide === "top")
      return {
        top: collapsed ? 0 : -offset,
      };
    if (dockingSide === "bottom")
      return {
        bottom: collapsed ? 0 : -offset,
      };
  };

  // configure hotkey state
  useHotkeys(
    HotkeyConfig.HIDE_UI,
    () => {
      if (collapsed) {
        openPanel();
        return;
      }
      closePanel();
    },
    [collapsed]
  );

  // drag handle behaviour

  const docBodyRef = useRef(document.body);

  return (
    <>
      <motion.button
        className={`panel__button panel__button--${dockingSide}`}
        onClick={openPanel}
        animate={getPanelButtonPos(collapsed, dockingSide)}
        transition={config.DEFAULT_TRANSITION}
      >
        <img src={getArrow(dockingSide)} />
      </motion.button>

      {/* resize handle */}
      <motion.div
        //@ts-ignore
        drag={(resizableX && "x") || (resizableY && "y")}
        style={{
          cursor: "col-resize",
        }}
        className={`panel__drag-handle panel__drag-handle--${dockingSide}`}
        animate={panelHandleAnimator}
        whileHover={{
          opacity: 1,
        }}
        dragMomentum={false}
        dragConstraints={docBodyRef}
        onDrag={onDrag}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        transition={config.DEFAULT_TRANSITION}
      ></motion.div>

      <motion.div
        className={`panel panel--${dockingSide}`}
        animate={panelSizeAnimator}
        transition={config.DEFAULT_TRANSITION}
      >
        {/* panel content */}
        {header && <h2 className="header-label panel-hor-spacing">{header}</h2>}
        {children}
      </motion.div>
    </>
  );
};
