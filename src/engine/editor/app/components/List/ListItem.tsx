import React from "react";

interface Props {
  children: string;
  onSelect?: (value: string, index?: string) => void;
  value: string;
  isSelected?: boolean;
  index?: string;
  onContextMenu?: (e) => void;
}

export const ListItem = ({
  children,
  isSelected,
  onSelect,
  value,
  index,
  onContextMenu,
}: Props) => {
  const handleClick = () => {
    onSelect && onSelect(value, index);
  };

  const handleContextualMenu = (e) => {
    handleClick();
    onContextMenu && onContextMenu(e);
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextualMenu}
      className={!isSelected ? "list-item" : "list-item list-item--selected"}
    >
      {children}
    </div>
  );
};
