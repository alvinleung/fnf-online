import React, { useState } from "react";
import { ListItem } from "./ListItem";

import "./List.css";

interface Props {
  onSelect?: (value: string, index: number) => {};
  children?: React.ReactElement[] | React.ReactElement;
}

export const List = ({ children, onSelect }: Props) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const listItems = children instanceof Array ? children : [children];

  const handleListItemSelect = (value: string, index: number) => {
    // set the item
    setSelectedItemIndex(index);
    // call back
    onSelect && onSelect(value, index);
  };

  return (
    <div className="list">
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
