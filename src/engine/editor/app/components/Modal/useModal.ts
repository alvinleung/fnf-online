import { useState } from "react";
function useModal(): [boolean, () => void, () => void] {
  const [isVisible, setIsVisible] = useState(false);

  function toggleModal() {
    setIsVisible(!isVisible);
  }

  function hideModal() {
    setIsVisible(false);
  }
  function showModal() {
    setIsVisible(true);
  }

  return [isVisible, showModal, hideModal];
}
export default useModal;
