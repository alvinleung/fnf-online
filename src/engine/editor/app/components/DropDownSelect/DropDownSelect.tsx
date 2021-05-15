import { AnimatePresence, motion } from "framer-motion";
import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
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

export const DropDownSelect = ({ selected, children, onSelect, focus = false, onBlur }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [currentItem, setCurrentItem] = useState(selected);

  const filterRef = useRef<HTMLInputElement>();
  const [filterValue, setFilterValue] = useState("");
  const [filteredList, setFilteredList] = useState([]);

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

  children = children instanceof Array ? children : [children];

  useEffect(() => {
    // when there is no filter
    if (filterValue === "") {
      setFilteredList(children);
      return;
    }

    const filteredChildren = children.filter((child: ReactNode) => {
      //@ts-ignore
      const { children, value } = child.props;

      const isSatisfyFilter =
        children.toLowerCase().includes(filterValue.toLowerCase()) ||
        value.toLowerCase().includes(filterValue.toLowerCase());

      return isSatisfyFilter;
    });

    // auto select the first item in the filtered list
    if (filteredChildren.length !== 0) {
      //@ts-ignore
      setCurrentItem(filteredChildren[0].props.children);
    }

    setFilteredList(filteredChildren);
  }, [filterValue]);

  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentItemIndex = filteredList.findIndex((dropDownItem) => {
        //@ts-ignore
        return dropDownItem.props.value === currentItem;
      });

      if (e.code === "ArrowUp" && currentItemIndex > 0) {
        // get the next item on list
        const prevItem = currentItemIndex - 1;
        //@ts-ignore
        setCurrentItem(filteredList[prevItem].props.value);
      }
      if (e.code === "ArrowDown" && currentItemIndex < filteredList.length - 1) {
        const nextItem = currentItemIndex + 1;
        //@ts-ignore
        setCurrentItem(filteredList[nextItem].props.value);
      }
    },
    [filteredList, filterValue, currentItem]
  );

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
                    <span>{currentItem.split(new RegExp(`(${filterValue})`, "ig"))[2]}</span>
                  </>
                )}
              </div>
              <div>{filteredList}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button className="drop-down-select__toggle" onClick={() => setExpanded(!expanded)}>
          {selected ? selected : "\u00A0"}
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
