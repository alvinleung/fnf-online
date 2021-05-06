import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { config } from "../AnimationConfig";
import "./EntityInspectorHead.css";

interface Props {
  selectedEntity?: string;
}

export const EntityInspectorHead = ({ selectedEntity }: Props) => {
  return (
    // <div>
    <AnimatePresence>
      {selectedEntity && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={config.DEFAULT_TRANSITION}
          className="entity-inspector-head"
        >
          <div className="panel-hor-spacing header-label">Inspecting</div>
          <div className="panel-hor-spacing entity-inspector-head__entity-name">
            {selectedEntity}
          </div>
          {/* <div className="entity-inspector-head__entity-name panel-hor-spacing"></div> */}
        </motion.div>
      )}
    </AnimatePresence>
    // </div>
  );
};
