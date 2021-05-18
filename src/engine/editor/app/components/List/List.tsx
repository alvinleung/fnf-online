import React, { useRef, useState, useEffect, useMemo } from "react";
import { ListItem } from "./ListItem";

import "./List.css";
import useClickOutside from "../../hooks/useClickOutside";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";

interface Props {
  onSelect?: (value: string, index?: number) => void;
  children?: React.ReactElement[] | React.ReactElement;
  onItemRemove?: (itemValue: string) => void;
  removable?: boolean;
  value: string;
}

export const List = ({ children, onSelect, removable = true, onItemRemove, value }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedItemValue, setSelectedItemValue] = useState("");
  const listItems = children instanceof Array ? children : [children];

  const [isListFocused, setIsListFocused] = useState(false);

  const handleListItemSelect = (value: string, index: number) => {
    // set the item
    setSelectedItemIndex(index);
    setSelectedItemValue(value);
    // call back
    onSelect && onSelect(value, index);
  };

  const listContainerRef = useRef();
  const handleListClick = () => {
    setIsListFocused(true);
  };

  // hack for allowing to press delete when focus in the canvas
  const viewport = useMemo(() => document.querySelector("canvas"), []);
  useClickOutside([listContainerRef, viewport], () => {
    setIsListFocused(false);
  });

  useEffect(() => {
    setIsListFocused(true);
  }, [value]);

  const removeSelectedEntity = () => {
    if (!selectedItemValue) return;

    removable && onItemRemove && onItemRemove(selectedItemValue);
    // clear the selection
    setSelectedItemIndex(null);
    setSelectedItemValue("");
  };

  useHotkeys(
    HotkeyConfig.DELETE,
    () => {
      if (isListFocused) {
        removeSelectedEntity();
      }
    },
    [selectedItemValue, isListFocused]
  );

  useEffect(() => {
    // get the selected item index
    const index = listItems.findIndex((item) => {
      return item.props.value === value;
    });

    // change value
    setSelectedItemIndex(index);
    setSelectedItemValue(value);
  }, [value]);

  return (
    <>
      <div className="list" onClick={handleListClick} ref={listContainerRef}>
        {listItems.map((listItem, index) => {
          return (
            <ListItem
              {...listItem.props}
              index={index}
              key={index}
              isSelected={index === selectedItemIndex}
              onSelect={handleListItemSelect}
            />
          );
        })}
      </div>
    </>
  );
};
