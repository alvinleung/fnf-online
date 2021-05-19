import React, { ButtonHTMLAttributes } from "react";
import { useMemo } from "react";

interface ButtonProps extends ButtonHTMLAttributes<any> {
  primary?: boolean;
  secondary?: boolean;
  children: string;
}
export function Button({ primary, secondary, ...props }: ButtonProps) {
  const styling = useMemo(() => {
    if (secondary) return "btn-secondary";
    return "btn-primary";
  }, [primary, secondary]);

  return (
    <button className={styling} {...props}>
      {props.children}
    </button>
  );
}
