"use client";
import { useDeleteDocumentDialog, useSelectedDocuments } from "@/lib/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { deleteDocuments } from "@/lib/db/documents";
import toast from "react-hot-toast";
import { queryClient } from "@/lib/session-provider";

const DeleteDocumentDialog = () => {
  const { isDeleteDocumentDialogOpen, setIsDeleteDocumentDialogOpen } =
    useDeleteDocumentDialog();
  const { selectedDocuments, setSelectedDocuments } = useSelectedDocuments();

  const handleDeleteDocuments = async () => {
    // console.log("Deleting documents");
    const ids = Array.from(selectedDocuments!);
    // console.log(ids);
    const { ok, error } = await deleteDocuments(ids);
    if (!ok) {
      console.error(error);
      toast.error(error);
      return;
    }
    toast.success("Documents deleted successfully");
    setSelectedDocuments!([]);
    await queryClient.refetchQueries(["documents-lists"]);
    setIsDeleteDocumentDialogOpen!(false);
  };
  return (
    <Dialog
      open={isDeleteDocumentDialogOpen}
      onOpenChange={setIsDeleteDocumentDialogOpen}
    >
      <DialogContent className="max-w-md block bg-neutral-100 border border-neutral-200/60 dark:border-neutral-600 dark:bg-neutral-900 ">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedDocuments?.length}{" "}
            document&apos;s?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 w-full flex items-center justify-end">
          <div className="flex items-center justify-center gap-x-2">
            <Button
              onClick={() => {
                setSelectedDocuments!([]);
                setIsDeleteDocumentDialogOpen!(false);
              }}
              size={"sm"}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button onClick={() => handleDeleteDocuments()} size={"sm"}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDocumentDialog;
