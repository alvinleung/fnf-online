import React, { useRef, useState } from "react";
import { ListItem } from "./ListItem";

import "./List.css";
import useClickOutside from "../hooks/useClickOutside";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../Hotkeys";

interface Props {
  onSelect?: (value: string, index?: number) => void;
  children?: React.ReactElement[] | React.ReactElement;
  onItemRemove: (itemValue: string) => void;
}

export const List = ({ children, onSelect, onItemRemove }: Props) => {
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
  useClickOutside(listContainerRef, () => {
    setIsListFocused(false);
  });

  useHotkeys(
    HotkeyConfig.DELETE,
    () => {
      onItemRemove && onItemRemove(selectedItemValue);
    },
    [selectedItemValue]
  );

  return (
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
  );
};
