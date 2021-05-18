import React, { useEffect, useState } from "react";
import hasPropChanged from "../../hooks/hasPropChanged";

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
  const [isItemSelected, setIsItemSelected] = useState(false);

  const handleClick = () => {
    setIsItemSelected(true);
    onSelect && onSelect(value, index);
  };

  useEffect(() => {
    if (isSelected && isSelected !== isItemSelected) {
      onSelect && onSelect(value, index);
    }
    setIsItemSelected(isSelected);
  }, [isSelected]);

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
