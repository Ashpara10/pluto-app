import { getAllCollections } from "@/lib/actions";
import { useAddToCollection, useSelectedDocuments } from "@/lib/context";
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
import { db } from "@/lib/db/drizzle";
import { documents } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const AddToCollectionPayloadSchema = z.object({
  documents: z.string().array(),
});

const AddToCollectionDialog = () => {
  const { selectedDocuments, setSelectedDocuments } = useSelectedDocuments();
  const { workspace } = useParams();
  const [checkedCollection, setCheckedCollection] = useState<string[]>([]);
  const { isAddToCollectionDialogOpen, setIsAddToCollectionDialogOpen } =
    useAddToCollection();
  const { data } = useQuery({
    queryKey: ["all-collections", workspace],
    queryFn: async () => await getAllCollections(workspace as string),
    refetchOnWindowFocus: false,
  });

  return (
    <Dialog
      open={isAddToCollectionDialogOpen}
      onOpenChange={setIsAddToCollectionDialogOpen}
    >
      <DialogContent
        style={{ borderRadius: 30 }}
        className="w-full max-w-3xl h-[70vh] border border-neutral-300/60 dark:border-neutral-600   p-0 overflow-hidden bg-neutral-50 backdrop-blur-2xl dark:bg-neutral-900 flex flex-col  items-center justify-center"
      >
        <DialogHeader className="pt-6 h-fit w-full px-4 border-b border-neutral-300/60 dark:border-neutral-600 pb-4">
          <DialogTitle className="text-lg font-medium">
            Add to Collection
          </DialogTitle>
          <DialogDescription className="">
            Move and organize your documents in collections for effecient
            retrieval and access.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="w-full h-full">
          <div className="w-full h-full grid sm:grid-cols-2 md:grid-cols-3 gap-2 px-4 py-2">
            {data?.data?.map((collection, i) => {
              return (
                <CollectionCard
                  collection={collection}
                  key={i}
                  checked={checkedCollection.includes(
                    collection.collection?.id
                  )}
                  handleCheckChange={(checked, id) => {
                    setCheckedCollection((prev) => {
                      const set = new Set(prev);
                      if (set.has(id)) {
                        // prev.filter((item) => item !== id);
                        set.delete(id);
                        return Array.from(set);
                      } else {
                        set.add(id);
                        return Array.from(set);
                      }
                    });
                  }}
                />
              );
            })}
          </div>
        </ScrollArea>
        <div className="mb-4 gap-3 flex items-center justify-center w-full px-4">
          <Button
            onClick={() => {
              setSelectedDocuments!([]);
              setIsAddToCollectionDialogOpen!(false);
            }}
            className="w-full"
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              console.log(selectedDocuments, checkedCollection);
              checkedCollection.map(async (col) => {
                try {
                  // const data = await db
                  //   .update(documents)
                  //   .set({ collectionId: col })
                  //   .where(inArray(documents.id, selectedDocuments as string[]))
                  //   .returning();
                  // console.log(data);
                } catch (error) {
                  toast.error("Failed to move documents to collection");
                }
              });
            }}
            disabled={selectedDocuments?.length === 0}
            className="disabled:opacity-80 w-full"
          >
            Move Documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCollectionDialog;
