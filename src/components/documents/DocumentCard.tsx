"use client";
import { deleteDocuments, handleDocumentFavourites } from "@/lib/db/documents";
import { Document } from "@/lib/db/schema";
import { queryClient } from "@/lib/session-provider";
import { cn } from "@/lib/utils";
import { SquareArrowOutUpRight, Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

type DocumentCardProps = {
  document: Document;
  checked?: boolean;
  isFavourite?: boolean;
  handleCheckChange: (checked: boolean, id: string) => void;
};

const DocumentCardItem = ({
  document,
  checked,
  handleCheckChange,
  isFavourite,
}: DocumentCardProps) => {
  const session = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const [optimisticIsFavorite, addOptimistic] = useOptimistic(
    isFavourite as boolean,
    (state, newData: boolean) => {
      return newData;
    }
  );

  const handleFavourites = async () => {
    addOptimistic(!optimisticIsFavorite);
    const { ok, data, error } = await handleDocumentFavourites({
      id: document.id,
      isFavorite: !isFavourite,
    });
    if (!ok && error) {
      toast?.error(error);
      return;
    }
    toast.success(
      data?.isFavorite ? "Added to favourites" : "Removed from favourites"
    );
  };

  const handleDelete = async () => {
    const agree = confirm("Are you sure you want to delete this document?");
    if (!agree) return;
    const { ok, error } = await deleteDocuments([document.id]);
    if (!ok && error) {
      toast?.error(error);
      return;
    }

    toast.success("Document deleted successfully");
    queryClient.refetchQueries(["documents-lists"]);
  };

  const handleClick = () => {
    router.push(
      `/w/${session?.data?.user?.activeWorkspace?.slug}/document/${document.id}`
    );
  };

  const handleMoveDocument = () => {
    handleCheckChange(true, document?.id);
  };
  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-xl  hover:bg-neutral-200/40 hover:dark:bg-lightGray/10 transition-all delay-75 ease-in relative group cursor-pointer"
    >
      <Checkbox
        checked={checked}
        className={cn(
          `data-[state=checked]:bg-violet-600`,
          "absolute right-2 top-2 group-hover:opacity-100 data-[state=checked]:opacity-100 opacity-0  transition-opacity "
        )}
        onCheckedChange={(checked) => {
          handleCheckChange(checked as boolean, document?.id);
        }}
      />
      <CardHeader className="flex flex-col items-center justify-between">
        <CardTitle
          onClick={handleClick}
          className="text-lg font-medium line-clamp-2 w-full tracking-tight leading-tight"
        >
          {document?.title || "Untitled"}
        </CardTitle>
        <div className="w-full">
          <span className="text-sm opacity-80">
            {new Date(document?.createdAt)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="w-full flex flex-wrap  gap-1.5">
          {document?.tags?.slice(0, 3)?.map((tag, i) => {
            return (
              <div
                key={i}
                className="px-2 text-sm  py-1 rounded-lg dark:bg-lightGray/10 bg-neutral-200/80"
              >
                <span className="text-neutral-700 dark:text-white/60">
                  {tag}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <div
        className={cn(
          "flex absolute bottom-1 right-2 opacity-0 transition-all  items-center justify-center gap-x-1 ",
          isHovered && "opacity-100"
        )}
      >
        <Button
          variant={"outline"}
          size={"smallIcon"}
          onClick={handleFavourites}
          className="p-1 rounded-lg hover:dark:bg-lightGray/10 bg-white"
        >
          <Star
            strokeWidth={1.07}
            className={cn(
              "opacity-80 size-4",
              isFavourite && "opacity-100 fill-yellow-400 stroke-yellow-500"
            )}
          />
        </Button>
        <Button
          onClick={handleMoveDocument}
          variant={"outline"}
          size={"smallIcon"}
          className="p-1 rounded-lg hover:dark:bg-lightGray/10 bg-white"
        >
          <SquareArrowOutUpRight
            strokeWidth={1.07}
            className="opacity-80 size-4"
          />
        </Button>
        <Button
          variant={"outline"}
          size={"smallIcon"}
          onClick={handleDelete}
          className="p-1 rounded-lg hover:dark:bg-lightGray/10 bg-white"
        >
          <Trash2 strokeWidth={1.07} className="opacity-80 size-4" />
        </Button>
      </div>
    </Card>
  );
};

export default DocumentCardItem;
