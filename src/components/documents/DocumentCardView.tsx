"use client";
import { useSelectedDocuments } from "@/lib/context";
import { TGetDocument } from "@/lib/types";
import { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import DocumentCardItem from "./DocumentCard";

type DocumentCardViewProps = {
  data: TGetDocument[];
  isLoading: boolean;
};

const DocumentCardView: FC<DocumentCardViewProps> = ({ data }) => {
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
    <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ">
      {data?.map(({ document, isFavorite }, i) => {
        return (
          <DocumentCardItem
            key={i}
            checked={selectedDocuments?.includes(document?.id)}
            handleCheckChange={(checked) =>
              handleCheckBoxChange(checked, document?.id)
            }
            isFavourite={isFavorite}
            document={document}
          />
        );
      })}
    </section>
  );
};

export default DocumentCardView;

export const DocumentCardViewSkeleton = () => {
  return (
    <div className="w-full  grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ">
      {[...Array(18)].map((_, i) => {
        return (
          <Skeleton
            key={i}
            className=" h-[200px] w-full animate-pulse rounded-lg bg-darkGray/60 dark:bg-lightGray/10"
          />
        );
      })}
    </div>
  );
};
