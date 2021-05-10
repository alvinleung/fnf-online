import React from "react";

interface Props {
  children?: string;
  value: string;
  onSelect?: (val) => void;
  selected: boolean;
}

export const DropDownItem = (props: Props) => {
  return (
    <div
      className={"drop-down-select__item"}
      onClick={() => props.onSelect(props.value)}
    >
      {props.children}
    </div>
  );
};
