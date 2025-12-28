import React from "react";
import CreateCollectionDialog from "./CreateCollectionDialog";
import CreateDocumentDialog from "./CreateDocumentDialog";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import DeleteDocumentDialog from "./DeleteDocumentDialog";
import DeleteWorkspaceDialog from "./DeleteWorkspaceDialog";
import AddToCollectionDialog from "./AddToCollection";
import SearchDialog from "./SearchDialog";

const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <CreateDocumentDialog />
      <CreateCollectionDialog />
      <AddToCollectionDialog />
      <CreateWorkspaceDialog />
      <DeleteDocumentDialog />
      <DeleteWorkspaceDialog />
      <SearchDialog />
      {children}
    </>
  );
};

export default DialogProvider;
