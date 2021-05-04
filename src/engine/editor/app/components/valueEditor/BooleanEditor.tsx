import { motion } from "framer-motion";
import React, { useState } from "react";
import { config } from "../../AnimationConfig";

interface Props {
  name: string;
  initialValue?: boolean;
}

export const BooleanEditor = (props: Props) => {
  const [on, setOn] = useState(props.initialValue);
  const toggleCheck = () => {
    setOn(!on);
  };

  return (
    <div className="value-editor">
      <label className="value-editor__field">
        <div className="value-editor__label">{props.name}</div>
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
              backgroundColor: on ? "var(--clr-accent)" : "#333",
              x: on ? "100%" : "0%",
            }}
            transition={config.DEFAULT_TRANSITION}
          />
          <input
            type="checkbox"
            onChange={toggleCheck}
            checked={on}
            style={{ display: "none" }}
          />
        </motion.div>
      </label>
    </div>
  );
};
