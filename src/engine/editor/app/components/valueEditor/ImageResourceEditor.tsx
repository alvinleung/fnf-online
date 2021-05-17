import { motion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image as GameImage, Image } from "../../../../graphics/Image/Image";
import { useGameContext } from "../../EditorContextWrapper";
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

function ImageSelectModal(props) {
  return (
    <Modal isVisible={props.isVisible} onHide={props.hideModal} canDismissClickOutside={true}>
      <h2>Select Image</h2>
      <label>
        Filter
        <input
          type="text"
          onChange={props.handleFilterTextChange}
          value={props._filterText}
          ref={props.filterTextRef}
        />
      </label>
      <div
        className={
          props.focused ? "resource-container resource-container--focus" : "resource-container"
        }
        onClick={() => {
          props.setSelected(null);
          props.setFocused(true);
        }}
      >
        {props.filteredImageList.map((image, index) => (
          <div
            key={index}
            className={
              props.selected === image.name
                ? "resource-item resource-item--selected"
                : "resource-item"
            }
            onClickCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
              props.setSelected(image.name);
              props.setFocused(true);
            }}
          >
            <img className="resource-item__image" src={image.path} draggable={false} />
            <div className="resource-item__name">{image.name}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export const ImageResourceEditor = ({ name, value, onChange }: Props) => {
  const containerRef = useRef();
  const gameRef = useGameContext();

  const [selected, setSelected] = useState(value ? value.name : "");
  const [focused, setFocused] = useState(false);

  // const images = assetList.images;
  const assetImageDict = useMemo(() => gameRef.assets.image.getAssetDictionary(), []);
  const images = useMemo(
    () =>
      Object.values(assetImageDict).reduce((list, image, index) => {
        list.push(image);

        return list;
      }, []),
    []
  );
  const [filteredImageList, setFilteredImageList] = useState(images);

  useEffect(() => {
    if (!selected || selected === "") return;

    onChange && onChange(gameRef.assets.image.get(selected) || Image.createEmpty());
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
      <ImageSelectModal
        selected={selected}
        setSelected={setSelected}
        focused={focused}
        setFocused={setFocused}
        filteredImageList={filteredImageList}
        filterTextRef={filterTextRef}
        filterText={filterText}
        handleFilterTextChange={handleFilterTextChange}
        _filterText={filterText}
        isVisible={isVisible}
        hideModal={hideModal}
      ></ImageSelectModal>
    </>
  );
};
