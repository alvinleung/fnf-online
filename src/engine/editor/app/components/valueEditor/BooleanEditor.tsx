import { motion } from "framer-motion";
import React, { useState } from "react";
import { config } from "../../AnimationConfig";

interface Props {
  name: string;
  value?: boolean;
  onChange: (val: boolean) => void;
}

export const BooleanEditor = ({ value = false, onChange, name }: Props) => {
  const toggleCheck = () => {
    onChange && onChange(!value);
  };

  return (
    <div className="value-editor">
      <label className="value-editor__field">
        <div className="value-editor__label">{name}</div>
        <motion.div
          style={{
            cursor: "pointer",
            border: "1px solid #333",
          }}
        >
          <motion.div
            animate={{
              height: "100%",
              width: "50%",
              backgroundColor: value ? "var(--clr-accent)" : "#333",
              x: value ? "100%" : "0%",
            }}
            transition={config.DEFAULT_TRANSITION}
          />
          <input
            type="checkbox"
            onChange={toggleCheck}
            checked={value}
            style={{ display: "none" }}
          />
        </motion.div>
      </label>
    </div>
  );
};
