import React from "react";

interface Props {
  children: string | React.ReactNode;
  onSelect?: (value: string, index?: string) => void;
  value: string;
  isSelected?: boolean;
  index?: string;
  onContextMenu?: (e) => void;
  onDoubleClick?: (e) => void;
}

export const ListItem = ({
  children,
  isSelected,
  onSelect,
  value,
  index,
  onContextMenu,
  onDoubleClick,
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
      onDoubleClick={onDoubleClick}
      className={!isSelected ? "list-item" : "list-item list-item--selected"}
    >
      {children}
    </div>
  );
};
