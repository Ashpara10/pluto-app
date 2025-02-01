"use client";
import { getCollectionDocuments } from "@/lib/actions";
import { useActiveView } from "@/lib/context";
import { SortDocumentBy, TGetDocument } from "@/lib/types";
import { useQueryState } from "nuqs";
import { FC } from "react";
import { useQuery } from "react-query";
import EmptyDocuments from "../empty-documents";
import DocumentCardView, { DocumentCardViewSkeleton } from "./DocumentCardView";
import DocumentListView, { DocumentListViewSkeleton } from "./DocumentListView";
import { Collection } from "@/lib/db/schema";

type CollectionDocumentsProps = {
  workspace: string;
  slug: string;
  initialData: { documents: TGetDocument[]; collection: Collection };
};

const CollectionDocuments: FC<CollectionDocumentsProps> = ({
  initialData,
  workspace,
  slug,
}) => {
  const [sortBy] = useQueryState("sortBy");
  const { activeView } = useActiveView();
  const { data, isFetching } = useQuery({
    initialData: { data: initialData, error: null },
    queryKey: ["collection-documents", slug, workspace, sortBy],
    queryFn: () =>
      getCollectionDocuments({
        slug,
        workspace,
        sortBy: sortBy as SortDocumentBy,
      }),
    refetchOnWindowFocus: false,
  });
  if (data === undefined || data?.data?.documents?.length === 0) {
    return <EmptyDocuments />;
  }
  if (isFetching) {
    return activeView === "list" ? (
      <DocumentListViewSkeleton />
    ) : (
      <DocumentCardViewSkeleton />
    );
  }

  return activeView === "grid" ? (
    <DocumentCardView
      data={data?.data?.documents as TGetDocument[]}
      isLoading={isFetching}
    />
  ) : (
    <DocumentListView
      data={data?.data?.documents as TGetDocument[]}
      isLoading={isFetching}
    />
  );
};

export default CollectionDocuments;
