import { getCookie } from "cookies-next";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type UpdateStateFunctionType = (isOpen: boolean) => void;

type ContextStateType = {
  activeView?: string;
  setActiveView?: React.Dispatch<React.SetStateAction<string>>;
  sidebarOpen: boolean;
  createDocumentDialogOpen: boolean;
  selectedDocuments?: string[];
  setSelectedDocuments?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCollections?: string[];
  setSelectedCollections?: React.Dispatch<React.SetStateAction<string[]>>;
  isCreateCollectionDialogOpen?: boolean;
  isCreateWorkspaceDialogOpen?: boolean;
  isDeleteWorkspaceDialogOpen?: boolean;
  isDeleteDocumentDialogOpen?: boolean;
  isAddToCollectionDialogOpen?: boolean;
  isSearchDialogOpen?: boolean;
};
type setContextType = [
  ContextStateType,
  {
    setSidebarOpen: UpdateStateFunctionType;
    setCreateDocumentDialogOpen: UpdateStateFunctionType;
    setIsCreateCollectionDialogOpen?: UpdateStateFunctionType;
    setIsAddToCollectionDialogOpen?: UpdateStateFunctionType;
    setIsCreateWorkspaceDialogOpen?: UpdateStateFunctionType;
    setIsDeleteWorkspaceDialogOpen?: UpdateStateFunctionType;
    setIsDeleteDocumentDialogOpen?: UpdateStateFunctionType;
    setIsSearchDialogOpen?: UpdateStateFunctionType;
  }
];

const defaultContextState: ContextStateType = {
  sidebarOpen: false,
  createDocumentDialogOpen: false,
  selectedDocuments: [],
  setSelectedDocuments: () => {},
  selectedCollections: [],
  setSelectedCollections: () => {},
  isCreateCollectionDialogOpen: false,
  isAddToCollectionDialogOpen: false,
  isCreateWorkspaceDialogOpen: false,
  isDeleteWorkspaceDialogOpen: false,
  isDeleteDocumentDialogOpen: false,
  isSearchDialogOpen: false,
};

export const Context = createContext([
  defaultContextState,
  {
    setSidebarOpen: () => {},
    setCreateDocumentDialogOpen: () => {},
    setIsCreateCollectionDialogOpen: () => {},
    setIsAddToCollectionDialogOpen: () => {},
    setIsCreateWorkspaceDialogOpen: () => {},
    setIsDeleteWorkspaceDialogOpen: () => {},
    setIsDeleteDocumentDialogOpen: () => {},
    setIsSearchDialogOpen: () => {},
  },
] as setContextType);

export const useSidebarOpenContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useDialogs must be used within a DialogsProvider");
  }

  return {
    sidebarOpen: context[0].sidebarOpen,
    setSidebarOpen: context[1].setSidebarOpen,
  };
};

export const useCreateDocumentDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useDialogs must be used within a DialogsProvider");
  }

  return {
    createDocumentDialogOpen: context[0].createDocumentDialogOpen,
    setCreateDocumentDialogOpen: context[1].setCreateDocumentDialogOpen,
  };
};
export const useCreateCollectionDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useDialogs must be used within a DialogsProvider");
  }

  return {
    createCollectionDialogOpen: context[0].isCreateCollectionDialogOpen,
    setCreateCollectionDialogOpen: context[1].setIsCreateCollectionDialogOpen,
  };
};

export const useSelectedDocuments = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    selectedDocuments: context[0].selectedDocuments,
    setSelectedDocuments: context[0].setSelectedDocuments,
  };
};
export const useSelectedCollections = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    selectedCollection: context[0].selectedCollections,
    setSelectedCollections: context[0].setSelectedCollections,
  };
};

export const useAddToCollection = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    isAddToCollectionDialogOpen: context[0].isAddToCollectionDialogOpen,
    setIsAddToCollectionDialogOpen: context[1].setIsAddToCollectionDialogOpen,
  };
};
export const useWorkspaceDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    isCreateWorkspaceDialogOpen: context[0].isCreateWorkspaceDialogOpen,
    setIsCreateWorkspaceDialogOpen: context[1].setIsCreateWorkspaceDialogOpen,
  };
};

export const useDeleteWorkspaceDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    isDeleteWorkspaceDialogOpen: context[0].isDeleteWorkspaceDialogOpen,
    setIsDeleteWorkspaceDialogOpen: context[1].setIsDeleteWorkspaceDialogOpen,
  };
};

export const useDeleteDocumentDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    isDeleteDocumentDialogOpen: context[0].isDeleteDocumentDialogOpen,
    setIsDeleteDocumentDialogOpen: context[1].setIsDeleteDocumentDialogOpen,
  };
};

export const useActiveView = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    activeView: context[0].activeView,
    setActiveView: context[0].setActiveView,
  };
};

export const useSearchDialog = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("Context error");
  }

  return {
    isSearchDialogOpen: context[0].isSearchDialogOpen,
    setIsSearchDialogOpen: context[1].setIsSearchDialogOpen,
  };
};

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [activeView, setActiveView] = useState(
    getCookie("activeView") || "list"
  );
  const [openContext, setOpenContext] =
    useState<ContextStateType>(defaultContextState);
  const setSidebarOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, sidebarOpen: isOpen });
    },
    [openContext, setOpenContext]
  );

  const setCreateDocumentDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, createDocumentDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );

  const setIsDeleteWorkspaceDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isDeleteWorkspaceDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );

  const setIsDeleteDocumentDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isDeleteDocumentDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );

  const setIsCreateCollectionDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCreateCollectionDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsAddToCollectionDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isAddToCollectionDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  const setIsCreateWorkspaceDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isCreateWorkspaceDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );

  const setIsSearchDialogOpen = useCallback(
    (isOpen: boolean) => {
      setOpenContext({ ...openContext, isSearchDialogOpen: isOpen });
    },
    [openContext, setOpenContext]
  );
  return (
    <Context.Provider
      value={[
        {
          ...openContext,
          selectedDocuments,
          setSelectedDocuments,
          activeView,
          setActiveView,
          selectedCollections,
          setSelectedCollections,
        },
        {
          setSidebarOpen,
          setCreateDocumentDialogOpen,
          setIsCreateWorkspaceDialogOpen,
          setIsCreateCollectionDialogOpen,
          setIsAddToCollectionDialogOpen,
          setIsDeleteWorkspaceDialogOpen,
          setIsDeleteDocumentDialogOpen,
          setIsSearchDialogOpen,
        },
      ]}
    >
      {children}
    </Context.Provider>
  );
};

export default AppContextProvider;
