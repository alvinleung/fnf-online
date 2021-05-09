import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import "./Modal.css";
import { config } from "../../AnimationConfig";
import { useHotkeys } from "react-hotkeys-hook";
import { HotkeyConfig } from "../../Hotkeys";
import useClickOutside from "../../hooks/useClickOutside";

interface Props {
  children: React.ReactNode | React.ReactNode[];
  isVisible: boolean;
  onHide?: () => void;
  width?: string | number;
  canDismiss?: boolean;
}

export const Modal = ({
  children,
  isVisible,
  onHide,
  width,
  canDismiss = true,
}: Props) => {
  useHotkeys(
    HotkeyConfig.ESCAPE,
    () => {
      canDismiss && onHide && onHide();
    },
    {
      enableOnTags: ["INPUT", "TEXTAREA"],
    },
    []
  );

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={"modal-container typography-base"}
          initial={{
            backgroundColor: "rgba(0,0,0,0)",
          }}
          animate={{
            backgroundColor: "rgba(0,0,0,.3)",
          }}
          exit={{
            backgroundColor: "rgba(0,0,0,0)",
          }}
          transition={config.DEFAULT_TRANSITION}
        >
          <motion.div
            className="modal-content"
            style={{
              width: width,
            }}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
              boxShadow: "0px 5px 10px 5px rgba(0,0,0,.2)",
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
            transition={config.DEFAULT_TRANSITION}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
