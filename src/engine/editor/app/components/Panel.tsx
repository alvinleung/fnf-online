import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { config } from "../AnimationConfig";
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

  const resizableX =
    dockingSide === "left" || dockingSide === "right" ? true : false;
  const resizableY =
    dockingSide === "bottom" || dockingSide === "top" ? true : false;

  function onDragStart() {
    setIsDragging(true);
  }
  function onDragEnd() {
    setIsDragging(false);
  }

  function onDrag(event: DragEvent, info) {
    const mouseX = info.point.x;
    const mouseY = info.point.y;
    switch (dockingSide) {
      case "left":
        if (mouseX < minSize) {
          setColapsed(true);
        } else {
          setColapsed(false);
        }
        setPanelSize(mouseX);
        break;
      case "right":
        if (window.innerWidth - mouseX < minSize) {
          setColapsed(true);
        } else {
          setColapsed(false);
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

  const openPanel = () => {
    setPanelSize(minSize);
    setColapsed(false);
  };

  useEffect(() => {
    return () => {};
  }, [collapsed]);

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
      <motion.div
        className={`panel panel--${dockingSide}`}
        style={{
          width: resizableX ? panelSize : "auto",
          height: resizableY ? panelSize : "auto",
        }}
        animate={{
          width: resizableX && collapsed ? 0 : panelSize,
        }}
        transition={config.DEFAULT_TRANSITION}
      >
        <motion.div
          //@ts-ignore
          drag={(resizableX && "x") || (resizableY && "y")}
          className={`panel__drag-handle panel__drag-handle--${dockingSide}`}
          animate={{
            opacity: isDragging ? 1 : 0,
          }}
          whileHover={{
            opacity: 1,
          }}
          onDrag={onDrag}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          transition={config.DEFAULT_TRANSITION}
          layout
        ></motion.div>
        {header && <h2 className="header-label panel-hor-spacing">{header}</h2>}
        {children}
      </motion.div>
    </>
  );
};
