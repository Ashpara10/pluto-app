"use client";
import { deleteDocuments, handleDocumentFavourites } from "@/lib/db/documents";
import { Document } from "@/lib/db/schema";
import { queryClient } from "@/lib/session-provider";
import { TGetDocument } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SquareArrowOutUpRight, Star, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
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
  const [sortBy] = useQueryState("sortBy");
  const { workspace } = useParams();

  const { mutate } = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      handleDocumentFavourites({ id, isFavorite }),
    onMutate: async ({ isFavorite, id }) => {
      console.log({ isFavorite, id });
      // cancel ongoing fetches so they don’t overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: ["documents-lists", workspace, sortBy],
      });

      // snapshot current state
      const previousDocs = queryClient.getQueryData<TGetDocument[]>([
        "documents-lists",
        workspace,
        sortBy,
      ]);
      console.log({ previousDocs });

      // optimistically update
      queryClient.setQueryData<TGetDocument[]>(
        ["documents-lists", workspace, sortBy],
        (old) =>
          old
            ? old.map((doc) =>
              doc.document?.id === id ? { ...doc, isFavorite } : doc
            )
            : []
      );

      // return context for rollback
      return { previousDocs };
    },

    onError: (_error, _vars, context) => {
      // rollback on error
      if (context?.previousDocs) {
        queryClient.setQueryData(
          ["documents-lists", workspace, sortBy],
          context.previousDocs
        );
      }
    },

    onSettled: () => {
      // always refetch after mutation to sync with server
      queryClient.invalidateQueries({
        queryKey: ["documents-lists", workspace, sortBy],
      });
    },
  });

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

  const markdownBlocks = document?.markdown?.split("\n");

  const content = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdownBlocks?.slice(0, 4).join("\n") as string);

  return (
    <Card
      className={cn(
        "rounded-2xl min-h-[180px] break-inside-avoid first:mt-0 mt-3 w-full hover:bg-neutral-200/40  bg-neutral-50 hover:dark:bg-neutral-800  transition-all ease-in dark:bg-neutral-900  border dark:border-[#DCDADE]/10 border-neutral-200 group flex relative overflow-hidden group cursor-pointer",
        checked &&
        "border-dashed hover:bg-current dark:border-violet-600 dark:bg-violet-800/5"
      )}
    >
      <Checkbox
        checked={checked}
        className={cn(
          `data-[state=checked]:bg-violet-600`,
          "absolute right-3 top-3 group-hover:opacity-100 data-[state=checked]:opacity-100 opacity-0 z-50  transition-opacity "
        )}
        onClick={(e) => {
          e.stopPropagation();
          // e.preventDefault();
        }}
        onCheckedChange={(checked) => {
          handleCheckChange(checked as boolean, document?.id);
        }}
      />
      <Link
        prefetch
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        href={`/w/${session?.data?.user?.activeWorkspace?.slug}/document/${document.id}`}
      >
        <CardHeader className="flex flex-col w-full items-center justify-between">
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
          <hr className="h-px dark:border-[#DCDADE]/10 w-full" />
          <div
            className="prose prose-sm prose-headings:font-medium prose-headings:text-sm dark:prose-invert prose-neutral prose-a:text-blue-600 prose-img:rounded-xl prose-h1:text-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardHeader>
      </Link>
      <div
        className={cn(
          "flex absolute bottom-2 right-2  transition-all  items-center justify-center gap-x-1 ",
          !isFavourite && "opacity-0 group-hover:opacity-100"
        )}
      >
        <Button
          variant={"outline"}
          size={"smallIcon"}
          onClick={(e) => {
            e.stopPropagation();
            mutate({
              id: document.id,
              isFavorite: !isFavourite,
            });
          }}
          className="p-1 rounded-lg cursor-pointer hover:dark:bg-lightGray/10 bg-white"
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
          className="p-1 rounded-lg cursor-pointer hover:dark:bg-lightGray/10 bg-white"
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
          className="p-1 rounded-lg cursor-pointer hover:dark:bg-lightGray/10 bg-white"
        >
          <Trash2 strokeWidth={1.07} className="opacity-80 size-4" />
        </Button>
      </div>
    </Card>
    // </Link>
  );
};

export default DocumentCardItem;
