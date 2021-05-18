import React, { Children, ReactElement, Ref, useRef } from "react";

interface RefWithInitialSize<T extends HTMLElement> {
  element: T;
  initialSize: number;
  dragging: boolean;
}

export interface ForwardRefProps<T> {
  onRef?: Ref<T>;
}

interface RefsWithInitialSizeHook<T extends HTMLElement> {
  getRef: (index: number) => RefWithInitialSize<T>;
  setRef: (index: number, element: T) => void;
  setRefDraggingState: (index: number, isDragging: boolean) => void;
  /**
   * Update the initial size of the element
   */
  resetRef: (index: number) => void;
  /**
   * Clone the children and pass `onRef` props to record the element ref.
   */
  childrenWithRef: <P extends ForwardRefProps<T>>(
    children: ReactElement<P> | ReactElement<P>[]
  ) => ReactElement<P>[];
}

export type Direction = "horizontal" | "vertical";

const createRefWithInitialSize = <T extends HTMLElement>(
  direction: Direction,
  element: T
): RefWithInitialSize<T> => {
  const boundingClientRect = element.getBoundingClientRect();

  if (direction == "horizontal") {
    return {
      element,
      initialSize: boundingClientRect.width,
      dragging: false,
    };
  } else {
    return {
      element,
      initialSize: boundingClientRect.height,
      dragging: false,
    };
  }
};
/**
 * Creates a ref that save the `dom element` and the `initial size` for a list of elements. *
 * @param direction ["horizontal"|"vertical"] Direction to save initial size. `horizontal` uses `width` | `vertical` uses `height`.
 */
export const useRefsWithInitialSize = <T extends HTMLElement>(
  direction: Direction
): RefsWithInitialSizeHook<T> => {
  const refs = useRef<RefWithInitialSize<T>[]>(null);

  const getRef = (index: number) => {
    const current = refs.current;
    return current ? current[index] : null;
  };

  const setRef = (index: number, element?: T) => {
    if (!element) return;

    const current = refs.current;
    refs.current = current ? [...current] : [];

    // hack: don't update the dragging refs
    if (refs.current[index] && refs.current[index].dragging) return;

    refs.current[index] = createRefWithInitialSize<T>(direction, element);
  };

  const setRefDraggingState = (index: number, isDragging: boolean) => {
    refs.current[index].dragging = isDragging;
  };

  const resetRef = (index: number) => {
    const current = refs.current;
    if (current && current[index] && current[index].element) {
      setRef(index, current[index].element);
    }
  };

  const childrenWithRef = <P extends ForwardRefProps<T>>(
    children: ReactElement<P> | ReactElement<P>[]
  ) => {
    return Children.map(children, (child, index) => {
      const newProps: Partial<P> = {};
      newProps.onRef = (ref: T) => setRef(index, ref);
      return React.cloneElement<P>(child, newProps);
    });
  };

  return {
    getRef,
    setRef,
    resetRef,
    setRefDraggingState,
    childrenWithRef,
  };
};
