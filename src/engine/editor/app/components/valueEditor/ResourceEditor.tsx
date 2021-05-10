import React, { useEffect, useRef, useState } from "react";
import { Image as GameImage } from "../../../../graphics/Image/Image";
import useClickOutside from "../../hooks/useClickOutside";
import { List } from "../List";
import { ListItem } from "../ListItem";

import "./ResourceEditor.css";

interface Props {
  name: string;
  value: any;
  onChange: (val: any) => void;
}

// get the resource list here
const assetList = require("../../../../../MyGameAssets").default;

export const ResourceEditor = ({ name, value, onChange }: Props) => {
  const containerRef = useRef();

  const [selected, setSelected] = useState(value.name);
  const [focused, setFocused] = useState(false);

  const images = assetList.images;
  const sounds = assetList.sounds;

  useEffect(() => {
    if (!selected) return;

    const imgRes = assetList.images.find(
      (element) => element.name === selected
    );

    const htmlImage = new Image();
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

  return (
    <div className="value-editor" ref={containerRef}>
      <div className="value-editor__group-name">{name}</div>
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
        {images.map((image, index) => (
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
    </div>
  );
};
