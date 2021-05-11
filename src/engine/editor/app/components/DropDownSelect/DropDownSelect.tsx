import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { config } from "../../AnimationConfig";
import useClickOutside from "../../hooks/useClickOutside";
import { HotkeyConfig } from "../../Hotkeys";
import "./DropDownSelect.css";

const ARROW_DOWN = require("url:../../images/arrow-down.svg");

const DropDownContext = React.createContext({
  selected: "",
  filter: "",
  hideMenu: () => {},
  select: (val: string) => {},
  onCommitSelection: (val: string) => {},
});

export const useDropDownContext = () => {
  return useContext(DropDownContext);
};

interface Props {
  children: React.ReactNode[];
  selected?: string;
  onSelect?: (val: string) => void;
  focus?: boolean;
  onBlur?: () => void;
}

export const DropDownSelect = ({
  selected,
  children,
  onSelect,
  focus = false,
  onBlur,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [currentItem, setCurrentItem] = useState(selected);

  const filterRef = useRef<HTMLInputElement>();
  const [filterValue, setFilterValue] = useState("");

  const dropDownContainerRef = useRef();
  useClickOutside(dropDownContainerRef, () => {
    hideMenu();
  });

  useEffect(() => {
    focus && setExpanded(true);
  }, [focus]);

  useEffect(() => {
    if (expanded) {
      filterRef.current.focus();
      setFilterValue("");
    }
  }, [expanded]);

  const hideMenu = () => {
    setExpanded(false);
    onBlur && onBlur();
  };

  useHotkeys(
    HotkeyConfig.ESCAPE,
    () => {
      hideMenu();
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  useHotkeys(
    HotkeyConfig.SUBMIT,
    () => {
      handleSelectCommit(currentItem);
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    }
  );

  const handleFilterKeyDown = (e: React.KeyboardEvent) => {
    const currentItemIndex = children.findIndex((dropDownItem) => {
      //@ts-ignore
      return dropDownItem.props.value === currentItem;
    });

    if (e.code === "ArrowUp" && currentItemIndex > 0) {
      // get the next item on list
      const prevItem = currentItemIndex - 1;
      //@ts-ignore
      setCurrentItem(children[prevItem].props.value);
    }
    if (e.code === "ArrowDown" && currentItemIndex < children.length - 1) {
      const nextItem = currentItemIndex + 1;
      //@ts-ignore
      setCurrentItem(children[nextItem].props.value);
    }
  };

  const handleSelectCommit = (value: string) => {
    onSelect && onSelect(value);
    hideMenu();
  };

  const handleSelect = (value: string) => {
    setCurrentItem(value);
  };

  return (
    <DropDownContext.Provider
      value={{
        selected: currentItem,
        filter: filterValue,
        hideMenu: hideMenu,
        onCommitSelection: handleSelectCommit,
        select: handleSelect,
      }}
    >
      <div className="drop-down-select" ref={dropDownContainerRef}>
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="drop-down-select__sheet"
              initial={{
                transformOrigin: "top center",
                // y: -20,
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                // y: 0,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                // y: -20,
                scale: 0.9,
                opacity: 0,
              }}
              transition={config.DEFAULT_TRANSITION}
            >
              <input
                type="text"
                ref={filterRef}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={handleFilterKeyDown}
                className="drop-down-select__filter-input"
              />
              <div className="drop-down-select__selection-hint">
                {filterValue === "" ? (
                  currentItem
                ) : (
                  <>
                    <span>{filterValue}</span>
                    <span>
                      {
                        currentItem.split(
                          new RegExp(`(${filterValue})`, "ig")
                        )[2]
                      }
                    </span>
                  </>
                )}
              </div>
              <div>{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          className="drop-down-select__toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {selected}
          <motion.img
            src={ARROW_DOWN}
            animate={{
              rotate: expanded ? 180 : 0,
            }}
            transition={config.DEFAULT_TRANSITION}
          />
        </button>
      </div>
    </DropDownContext.Provider>
  );
};
