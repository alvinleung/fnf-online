import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./CollapsableSection.css";
import { config } from "../AnimationConfig";

const ARROW_DOWN = require("url:../images/arrow-down.svg");

interface Props {
  header: string;
  children?: React.ReactElement[] | React.ReactElement | string;
}

export const CollapsableSection = React.memo(({ header, children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapseState = () => {
    setCollapsed(!collapsed);
  };

  const childrenArr = children instanceof Array ? children : [children];

  return (
    <div className="collapsable-section">
      <motion.button
        className="collapsable-section__toggle"
        whileHover={{ borderTopColor: "#555" }}
        onClick={toggleCollapseState}
        transition={config.DEFAULT_TRANSITION}
      >
        <motion.img
          src={ARROW_DOWN}
          animate={{
            rotate: collapsed ? 180 : 0,
          }}
          transition={config.DEFAULT_TRANSITION}
        />
        {header}
      </motion.button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            className="collapsable-section__group-container"
            initial={{
              height: 0,
              overflowY: "hidden",
            }}
            animate={{
              height: "auto",
              overflowY: "visible",
            }}
            exit={{
              height: 0,
              overflowY: "hidden",
            }}
            transition={config.DEFAULT_TRANSITION}
          >
            {childrenArr.map((children, index) => {
              return (
                <div className="collapsable-section__group" key={index}>
                  {children}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
