"use client";
import { deleteDocuments } from "@/lib/db/documents";
import { db } from "@/lib/db/drizzle";
import { Document, documents, workspaceToDocuments } from "@/lib/db/schema";
import { queryClient } from "@/lib/session-provider";
import { cn } from "@/lib/utils";
import { eq, not } from "drizzle-orm";
import { SquareArrowOutUpRight, Star, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Checkbox } from "../ui/checkbox";

type DocumentListProps = {
  document: Document;
  checked?: boolean;
  isFavourite?: boolean;
  handleCheckChange: (checked: boolean, id: string) => void;
};

const DocumentListItem = ({
  document,
  checked,
  handleCheckChange,
  isFavourite,
}: DocumentListProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { workspace } = useParams();
  const [isPending, startTransition] = useTransition();

  const [optimisticDocument, addOptimistic] = useOptimistic(
    document,
    (state, isFavourite: boolean) => {
      return { ...state, isFavorite: isFavourite };
    }
  );

  const handleFavourites = async () => {
    // Flip the optimistic state of `isFavorite`
    const newFavoriteState = !isFavourite;
    startTransition(async () => {
      try {
        // Optimistically update the state
        addOptimistic(!isFavourite);

        // Update the server
        await db
          .update(workspaceToDocuments)
          .set({ isFavorite: not(workspaceToDocuments.isFavorite) })
          .where(eq(workspaceToDocuments.documentId, optimisticDocument?.id))
          .returning();

        // Notify success
        toast.success(
          newFavoriteState ? "Added to favorites" : "Removed from favorites"
        );
      } catch (error) {
        toast.error("Failed to update favorites. Please try again.");
      }
    });
  };

  const handleDelete = async () => {
    const agree = confirm("Are you sure you want to delete this document?");
    if (!agree) return;
    const { ok, error } = await deleteDocuments([optimisticDocument.id]);
    if (!ok && error) {
      toast?.error(error);
      return;
    }

    toast.success("Document deleted successfully");
    queryClient.refetchQueries(["documents-lists", workspace]);
  };

  const handleClick = () => {
    router.push(`/w/${workspace}/document/${optimisticDocument.id}`);
  };

  const handleMoveDocument = () => {
    handleCheckChange(true, optimisticDocument?.id);
  };
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-2 rounded-lg cursor-pointer  py-0.5 hover:dark:bg-lightGray/5 hover:bg-neutral-200/60 flex w-full items-center justify-start truncate"
    >
      <Checkbox
        checked={checked}
        className={cn(`data-[state=checked]:bg-violet-600`)}
        onCheckedChange={(checked) => {
          handleCheckChange(checked as boolean, optimisticDocument?.id);
        }}
      />
      <div className="w-full flex items-center justify-between">
        <div className="ml-2 flex items-center justify-start">
          <span
            onClick={handleClick}
            className="truncate text-lg  leading-tight tracking-tight "
          >
            {optimisticDocument?.title || "Untitled"}
          </span>
          <span className="ml-2 text-sm opacity-80">
            {new Date(optimisticDocument?.createdAt)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
          </span>
        </div>
        <div
          className={cn(
            "flex invisible items-center justify-center gap-x-1 ",
            isHovered && "visible"
          )}
        >
          <button
            onClick={handleFavourites}
            className="p-1 rounded-lg hover:dark:bg-lightGray/10 hover:bg-neutral-200/30"
          >
            <Star
              strokeWidth={1.07}
              className={cn(
                "opacity-80 size-5",
                isFavourite && "opacity-100 fill-yellow-400 stroke-yellow-500"
              )}
            />
          </button>
          <button
            onClick={handleMoveDocument}
            className="p-1 rounded-lg hover:dark:bg-lightGray/10 hover:bg-neutral-200/30"
          >
            <SquareArrowOutUpRight
              strokeWidth={1.07}
              className="opacity-80 size-5"
            />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded-lg hover:dark:bg-lightGray/10 hover:bg-neutral-200/30"
          >
            <Trash2 strokeWidth={1.07} className="opacity-80 size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentListItem;
