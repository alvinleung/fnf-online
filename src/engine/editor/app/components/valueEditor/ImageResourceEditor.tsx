import { motion } from "framer-motion";
import path from "path";
import React, { ButtonHTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { AssetManager, ImageLoader } from "../../../../assets";
import { AssetLoaderEvent } from "../../../../assets/AssetLoader";
import { Image as GameImage, Image } from "../../../../graphics/Image/Image";
import { useGameContext } from "../../EditorContextWrapper";
import useClickOutside from "../../hooks/useClickOutside";
import { AssetExplorer } from "../AssetExplorer/AssetExplorer";
import { FileTypes, getFileType } from "../AssetExplorer/AssetExplorerUtils";
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

interface ButtonProps extends ButtonHTMLAttributes<any> {
  primary?: boolean;
  secondary?: boolean;
  children: string;
}
function Button({ primary, secondary, ...props }: ButtonProps) {
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

export const ImageResourceEditor = ({ name, value, onChange }: Props) => {
  const containerRef = useRef();
  const gameRef = useGameContext();

  const [selected, setSelected] = useState(value ? value.name : "");
  // const [focused, setFocused] = useState(false);

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

  // useEffect(() => {
  //   if (!selected || selected === "") return;

  //   onChange && onChange(gameRef.assets.image.get(selected) || Image.createEmpty());
  // }, [selected]);

  // useClickOutside(containerRef, () => {
  //   setFocused(false);
  // });

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

  // useEffect(() => {
  //   if (isVisible) filterTextRef.current.focus();
  // }, [isVisible]);

  /**
   * for controlling asset manager
   */

  const [assetSelection, setAssetSelection] = useState("");

  const changeSelectedImage = (imageAsset: Image) => {
    onChange && onChange(imageAsset);
    setSelected(imageAsset.name);
  };

  const isSelectionValid = (selection: string) => {
    const isImage = getFileType(selection) === FileTypes.IMAGE;

    console.log(selection);
    console.log(isImage);
    return isImage;
  };

  const commitSelection = () => {
    if (!assetSelection || assetSelection === "") return;

    // type check asset selection
    const isImage = getFileType(assetSelection) === FileTypes.IMAGE;
    if (!isImage) {
      alert("Selected file is not an image, please select again.");
      return;
    }

    // check if the image is in the asset sheet, if not add it
    const imageLoader = AssetManager.getInstance().image;
    const isResourceLoaded = imageLoader.hasAsset(assetSelection);

    if (isResourceLoaded) {
      changeSelectedImage(imageLoader.getAssetByPath(assetSelection));
      hideModal();
      return;
    }

    // tell the asset loader to load resource here and change
    imageLoader.add({
      path: assetSelection,
      name: path.parse(assetSelection).name,
    });

    const completeHandler = () => {
      // updat the resource
      changeSelectedImage(imageLoader.getAssetByPath(assetSelection));
      hideModal();

      // cleanup
      imageLoader.removeEventListener(AssetLoaderEvent.COMPLETE, completeHandler);
    };
    imageLoader.addEventListener(AssetLoaderEvent.COMPLETE, completeHandler);
    imageLoader.loadAll();
  };

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
        canDismissClickOutside={false}
        noPadding={true}
      >
        <AssetExplorer onChange={setAssetSelection} />
        <div className="explorer-controls">
          <Button onClick={commitSelection} disabled={!isSelectionValid(assetSelection)}>
            Select Image
          </Button>
          <Button onClick={hideModal} secondary>
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};
