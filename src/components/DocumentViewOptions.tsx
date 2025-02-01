"use client";
import { useActiveView, useSelectedDocuments } from "@/lib/context";
import { createDocument } from "@/lib/db/documents";
import { cn } from "@/lib/utils";
import { setCookie } from "cookies-next";
import { FileText, Filter, MoreVertical, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { FC, useState } from "react";
import DocumentFilterOptions from "./documents/DocumentFilterOptions";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

type DocumentViewOptionsProps = {
  children?: React.ReactNode;
  title?: string;
  documentsContainerClassName?: string;
  headerClassName?: string;
  isCollectionDocumentsPage?: boolean;
  collectionSlug?: string;
};

const DocumentViewOptions: FC<DocumentViewOptionsProps> = ({
  children,
  title,
  documentsContainerClassName,
  headerClassName,
  isCollectionDocumentsPage = false,
  collectionSlug,
}) => {
  const { activeView, setActiveView } = useActiveView();
  const [displayOptions, setDisplayOptions] = useState(false);
  const router = useRouter();
  const { workspace } = useParams();

  const onViewChange = (view: string) => {
    setActiveView!(view);
    setCookie("activeView", view);
  };

  return (
    <div className="mt-6 block w-full ">
      <div
        className={cn(
          "flex  w-full items-center justify-between px-3",
          headerClassName
        )}
      >
        <div className="flex items-center justify-center gap-x-2 px-1">
          <span className="text-xl ml-1 font-semibold leading-snug tracking-tight">
            {title}
          </span>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <Button
            variant={"outline"}
            onClick={async () => {
              const { data: document, error } = await createDocument({
                collection: isCollectionDocumentsPage
                  ? (collectionSlug as string)
                  : undefined,
              });
              if (error) {
                toast.error("Failed to create document. Please try again.");
                return;
              }
              router.push(`/w/${workspace}/document/${document?.id}`);
              toast.success("Document created successfully");
            }}
            size={"sm"}
          >
            <Plus className="size-4 opacity-80" />
            <span className="ml-2">New</span>
          </Button>

          <DocumentFilterOptions
            view={activeView!}
            open={displayOptions}
            setOpen={setDisplayOptions}
            onViewChange={onViewChange!}
          >
            <Button variant={"outline"} size={"sm"}>
              <Filter className="size-4 opacity-80" />
              <span className="ml-2">Filter</span>
            </Button>
          </DocumentFilterOptions>

          {/* <Button variant={"outline"} size={"smallIcon"}>
            <MoreVertical className="size-4 opacity-80" />
          </Button> */}
        </div>
      </div>
      <div className={cn("mt-4 px-2 w-full", documentsContainerClassName)}>
        {children}
      </div>
    </div>
  );
};

export default DocumentViewOptions;
