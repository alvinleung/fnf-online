import React from "react";

interface Props {
  children: string;
  onSelect?: (value: string, index: string) => {};
  value: string;
  isSelected?: boolean;
  index?: string;
}

export const ListItem = ({
  children,
  isSelected,
  onSelect,
  value,
  index,
}: Props) => {
  const handleClick = () => {
    onSelect && onSelect(value, index);
  };

  return (
    <div
      onClick={handleClick}
      className={!isSelected ? "list-item" : "list-item list-item--selected"}
    >
      {children}
    </div>
  );
};
