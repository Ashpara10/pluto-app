import {
  useAddToCollection,
  useDeleteDocumentDialog,
  useSelectedDocuments,
} from "@/lib/context";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { TGetDocument } from "@/lib/types";
import {
  Command,
  Sparkle,
  Sparkles,
  SquareArrowOutUpRight,
  Trash2,
  X,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { ReactNode, useMemo } from "react";
import { useQueryClient } from "react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { instance } from "@/lib/axios";
import { chunkMarkdown } from "@/lib/embeddings";
import { generateEmbedding } from "@/lib/db/documents";

export const KeyboardItem = ({
  icon,
  keys,
  ctrl = true,
}: {
  icon?: ReactNode;
  keys: string;
  ctrl?: boolean;
}) => {
  return (
    <kbd className="flex w-fit items-center justify-center gap-x-2">
      <div className="flex items-center justify-center rounded-md border border-neutral-300 p-1 dark:border-neutral-500/50">
        {(ctrl && icon) || <Command className="size-4 opacity-85 " />}
      </div>{" "}
      {keys?.split(",").map((key) => {
        return (
          <span
            key={key}
            className="flex items-center justify-center rounded-md border border-neutral-300 px-1 py-0.5 text-sm font-medium dark:border-neutral-500/50"
          >
            {key}
          </span>
        );
      })}
    </kbd>
  );
};

export const DefaultFloatingMenuFace = () => {
  return (
    <>
      <Sparkles
        strokeWidth={0.8}
        className="size-4.5 fill-black opacity-80 dark:fill-white"
      />{" "}
      <KeyboardItem keys="K" key={"default"} />
    </>
  );
};

export const SelectedDocumentsMenuFace = () => {
  const { currentWorkspace } = useWorkspaces();
  const [sortBy] = useQueryState("sortBy");
  const { selectedDocuments, setSelectedDocuments } = useSelectedDocuments();
  const { isAddToCollectionDialogOpen, setIsAddToCollectionDialogOpen } =
    useAddToCollection();
  const { setIsDeleteDocumentDialogOpen } = useDeleteDocumentDialog();

  const queryClient = useQueryClient();

  const selectedDocumentsData = useMemo(() => {
    const data = queryClient.getQueryData<TGetDocument[]>([
      "documents-lists",
      currentWorkspace?.slug,
      sortBy,
    ]);

    if (data?.length === 0) return [];

    return (
      data
        ?.filter((document) =>
          selectedDocuments?.includes(document.document.id)
        )
        .map((document) => document.document) || []
    );
  }, [queryClient, currentWorkspace?.slug, sortBy, selectedDocuments]);

  console.log({ selectedDocumentsData });

  return (
    <div className="flex w-full items-center justify-between">
      <span className="flex items-center justify-start gap-x-1">
        <span
          onClick={() => setSelectedDocuments!([])}
          className="mr-2 rounded-lg border border-darkGray/80 bg-transparent p-1.5 dark:border-[#424242]"
        >
          <X className="size-4 opacity-80" />
        </span>
        <span>{selectedDocuments?.length} </span>
        Documents
      </span>
      <div className="ml-3 flex items-center justify-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              onClick={async () => {
                console.log({ doc: selectedDocumentsData[0] });
                await generateEmbedding(
                  selectedDocumentsData[0]?.markdown || "",
                  selectedDocumentsData[0]?.id || ""
                );
              }}
              className=" rounded-lg border border-darkGray/80 bg-transparent p-1.5 dark:border-[#424242]"
            >
              <Sparkle className="size-4 opacity-80" />
            </TooltipTrigger>
            <TooltipContent>Chat with documents</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              onClick={() => setIsAddToCollectionDialogOpen!(true)}
              className=" rounded-lg border border-darkGray/80 bg-transparent p-1.5 dark:border-[#424242]"
            >
              <SquareArrowOutUpRight className="size-4 opacity-80" />
            </TooltipTrigger>
            <TooltipContent>Add to Folder</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              onClick={() => setIsDeleteDocumentDialogOpen!(true)}
              className=" rounded-lg border border-darkGray/80 bg-transparent p-1.5 dark:border-[#424242]"
            >
              <Trash2 className="size-4 opacity-80" />
            </TooltipTrigger>
            <TooltipContent>Move to Trash</TooltipContent>
          </Tooltip>
          {/* </span> */}
        </TooltipProvider>
      </div>
    </div>
  );
};
