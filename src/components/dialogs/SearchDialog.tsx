import { getAllCollections } from "@/lib/actions";
import {
  useAddToCollection,
  useSearchDialog,
  useSelectedDocuments,
} from "@/lib/context";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { z } from "zod";
import CollectionCard from "../collection/CollectionCard";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";

const SearchDialog = () => {
  const { isSearchDialogOpen, setIsSearchDialogOpen } = useSearchDialog();
  return (
    <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
      <DialogContent
        style={{ borderRadius: 30 }}
        className="w-full max-w-3xl h-[70vh] border border-neutral-300/60 dark:border-neutral-600   p-0 overflow-hidden bg-neutral-50 backdrop-blur-2xl dark:bg-neutral-900 flex flex-col  items-center justify-center"
      ></DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
