import React, { useContext, useState } from "react";

interface IAssetExplorerContext {
  defaultPath: string;
  setDefaultPath: React.Dispatch<React.SetStateAction<string>>;
}

export const AssetExplorerContext = React.createContext<IAssetExplorerContext>(null);

export const AssetExplorerContextProvider = ({ children }) => {
  const [path, setPath] = useState<string>("/");

  return (
    <AssetExplorerContext.Provider
      value={{
        defaultPath: path,
        setDefaultPath: setPath,
      }}
    >
      {children}
    </AssetExplorerContext.Provider>
  );
};

export const useAssetExplorerContext = () => useContext(AssetExplorerContext);
