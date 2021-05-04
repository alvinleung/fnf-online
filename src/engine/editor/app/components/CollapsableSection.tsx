import React, { useState } from "react";
import { motion } from "framer-motion";
import "./CollapsableSection.css";
import { config } from "../AnimationConfig";

const ARROW_DOWN = require("url:../images/arrow-down.svg");

interface Props {
  header: string;
  children?: React.ReactElement[] | React.ReactElement | string;
}

export const CollapsableSection = ({ header, children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapseState = () => {
    setCollapsed(!collapsed);
  };

  const childrenArr = children instanceof Array ? children : [children];

  return (
    <div className="collapsable-section">
      <motion.button
        className="collapsable-section__toggle header-label"
        whileHover={{ backgroundColor: "#555" }}
        onClick={toggleCollapseState}
        transition={config.DEFAULT_TRANSITION}
      >
        {header}
        <motion.img
          src={ARROW_DOWN}
          animate={{
            rotate: collapsed ? 180 : 0,
          }}
          transition={config.DEFAULT_TRANSITION}
        />
      </motion.button>
      {childrenArr.map((children, index) => {
        return (
          <motion.div
            key={index}
            className="collapsable-section__group-container"
            animate={{
              height: collapsed ? "0rem" : "auto",
            }}
            transition={config.DEFAULT_TRANSITION}
          >
            <div className="collapsable-section__group">{children}</div>
          </motion.div>
        );
      })}
    </div>
  );
};
