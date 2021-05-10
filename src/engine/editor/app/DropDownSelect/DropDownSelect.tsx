import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { config } from "../AnimationConfig";
import useClickOutside from "../hooks/useClickOutside";
import "./DropDownSelect.css";

const ARROW_DOWN = require("url:../images/arrow-down.svg");

interface Props {
  children: React.ReactNode;
  selectedValue: string;
  onFilter: (val: string) => void;
}

export const DropDownSelect = ({
  selectedValue,
  children,
  onFilter,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [currentValue, setCurrentValue] = useState("");

  const filterRef = useRef<HTMLInputElement>();
  const [filterValue, setFilterValue] = useState("");

  const dropDownContainerRef = useRef();
  useClickOutside(dropDownContainerRef, () => {
    setExpanded(false);
  });

  useEffect(() => {
    if (expanded) filterRef.current.focus();
  }, [expanded]);
  useEffect(() => {
    onFilter && onFilter(filterValue);
  }, [filterValue]);

  return (
    <div className="drop-down-select" ref={dropDownContainerRef}>
      <button
        className="drop-down-select__toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {selectedValue}
        <motion.img
          src={ARROW_DOWN}
          animate={{
            rotate: expanded ? 180 : 0,
          }}
          transition={config.DEFAULT_TRANSITION}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="drop-down-select__sheet"
            initial={{
              y: -20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={config.DEFAULT_TRANSITION}
          >
            <div className="field">
              <label>
                Filter
                <input
                  type="text"
                  ref={filterRef}
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  style={{ fontSize: "12px", padding: "var(--spacing-xs)" }}
                />
              </label>
            </div>
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
