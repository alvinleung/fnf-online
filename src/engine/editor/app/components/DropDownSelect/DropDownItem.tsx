import React from "react";
import { useDropDownContext } from "./DropDownSelect";

interface Props {
  children?: string;
  value: string;
}

export const DropDownItem = ({ value, children }: Props) => {
  const context = useDropDownContext();
  const isSelected = context.selected === value;

  return (
    <div
      className={
        isSelected
          ? "drop-down-select__item drop-down-select__item--selected"
          : "drop-down-select__item"
      }
      onMouseEnter={() => context.select(value)}
      onClick={() => context.onCommitSelection && context.onCommitSelection(value)}
    >
      {children}
    </div>
  );
};
