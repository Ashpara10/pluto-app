"use client";

import { useDeleteWorkspaceDialog } from "@/lib/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const DeleteWorkspaceDialog = () => {
  const { isDeleteWorkspaceDialogOpen, setIsDeleteWorkspaceDialogOpen } =
    useDeleteWorkspaceDialog();
  return (
    <Dialog
      open={isDeleteWorkspaceDialogOpen}
      onOpenChange={setIsDeleteWorkspaceDialogOpen}
    >
      <DialogContent className="max-w-md block bg-neutral-100 border border-neutral-200/60 dark:border-neutral-600 dark:bg-neutral-900 ">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription>
            A Workspace is a virtual space where you can collaborate, create and
            plan with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">Hello</div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWorkspaceDialog;
