import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Image as GameImage, Image } from "../../../../graphics/Image/Image";
import useClickOutside from "../../hooks/useClickOutside";
import { List } from "../List";
import { ListItem } from "../ListItem";
import { Modal } from "../Modal";
import useModal from "../Modal/useModal";

import "./ImageResourceEditor.css";

interface Props {
  name: string;
  value: Image;
  onChange: (val: any) => void;
}

// get the resource list here
const assetList = require("../../../../../MyGameAssets").default;

export const ImageResourceEditor = ({ name, value, onChange }: Props) => {
  const containerRef = useRef();

  const [selected, setSelected] = useState(value ? value.name : "");
  const [focused, setFocused] = useState(false);

  const images = assetList.images;
  const [filteredImageList, setFilteredImageList] = useState(images);

  useEffect(() => {
    if (!selected || selected === "") return;

    const imgRes = assetList.images.find(
      (element) => element.name === selected
    );

    const htmlImage = document.createElement("img");
    htmlImage.src = imgRes.path;
    htmlImage.onload = () => {
      // create a new image base on the selected
      const img = new GameImage(imgRes.name, imgRes.path, htmlImage);

      onChange && onChange(img);
    };
  }, [selected]);

  useClickOutside(containerRef, () => {
    setFocused(false);
  });

  const filterTextRef = useRef<HTMLInputElement>();
  const [filterText, setFilterText] = useState("");
  const handleFilterTextChange = (e) => {
    const filterText = e.target.value;
    setFilterText(filterText);
  };

  useEffect(() => {
    if (filterText === "") {
      setFilteredImageList(images);
    }

    // filter out options
    const filtererdList = (images as []).filter((img: any) => {
      if (img.name.includes(filterText)) return true;
    });

    setFilteredImageList(filtererdList);
  }, [filterText]);

  const [isVisible, showModal, hideModal] = useModal();
  const openResourceBrowser = () => {
    showModal();
  };

  useEffect(() => {
    if (isVisible) filterTextRef.current.focus();
  }, [isVisible]);

  return (
    <>
      <div className="value-editor" ref={containerRef}>
        <div className="value-editor__group-container">
          <label className="value-editor__field">
            <div className="value-editor__group-name">{name}</div>
            <motion.button
              style={{
                width: "100%",
                backgroundColor: "var(--clr-bg-lighter)",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255, .2)",
                color: "var(--clr-text)",
                padding: "var(--spacing-xs)",
              }}
              whileHover={{
                border: "1px solid rgba(255,255,255, .5)",
              }}
              onClick={() => {
                openResourceBrowser();
              }}
            >
              {selected || "\u00A0"}
            </motion.button>
          </label>
        </div>
      </div>
      <Modal
        isVisible={isVisible}
        onHide={hideModal}
        canDismissClickOutside={true}
      >
        <h2>Select Image</h2>
        <label>
          Filter
          <input
            type="text"
            onChange={handleFilterTextChange}
            value={filterText}
            ref={filterTextRef}
          />
        </label>
        <div
          className={
            focused
              ? "resource-container resource-container--focus"
              : "resource-container"
          }
          onClick={() => {
            setSelected(null);
            setFocused(true);
          }}
        >
          {filteredImageList.map((image, index) => (
            <div
              key={index}
              className={
                selected === image.name
                  ? "resource-item resource-item--selected"
                  : "resource-item"
              }
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelected(image.name);
                setFocused(true);
              }}
            >
              <img
                className="resource-item__image"
                src={image.path}
                draggable={false}
              />
              <div className="resource-item__name">{image.name}</div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
