"use client";
import { useSelectedDocuments } from "@/lib/context";
import { Document } from "@/lib/db/schema";
import { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import DocumentListItem from "./DocumentList";
import { TGetDocument } from "@/lib/types";

type DocumentListViewProps = {
  data: TGetDocument[];
  isLoading: boolean;
};
const DocumentListView: FC<DocumentListViewProps> = ({ data }) => {
  const { setSelectedDocuments, selectedDocuments } = useSelectedDocuments();

  const handleCheckBoxChange = (checked: boolean, id: string) => {
    setSelectedDocuments!((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return Array.from(newSet);
    });
  };
  return (
    <section className="w-full">
      {data?.map(({ document, isFavorite }, i) => {
        const isChecked = selectedDocuments?.includes(document?.id);
        return (
          <DocumentListItem
            key={i}
            checked={isChecked}
            isFavourite={isFavorite}
            handleCheckChange={(checked) =>
              handleCheckBoxChange(checked, document?.id)
            }
            document={document}
          />
        );
      })}
    </section>
  );
};

export default DocumentListView;

export const DocumentListViewSkeleton = () => {
  return [...Array(18)].map((_, i) => {
    return (
      <Skeleton
        key={i}
        className="mt-2 h-12 w-full animate-pulse rounded-lg bg-neutral-200/40 dark:bg-[#DCDADE]/10"
      />
    );
  });
};
