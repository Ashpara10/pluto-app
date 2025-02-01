"use client";

import { fetchDocuments } from "@/lib/actions";
import { useActiveView } from "@/lib/context";
import { Document } from "@/lib/db/schema";
import { FC } from "react";
import { useQuery } from "react-query";
import EmptyDocuments from "../empty-documents";
import DocumentCardView, { DocumentCardViewSkeleton } from "./DocumentCardView";
import DocumentListView, { DocumentListViewSkeleton } from "./DocumentListView";
import { SortDocumentBy, TGetDocument } from "@/lib/types";
import { useQueryState } from "nuqs";
import { useSession } from "next-auth/react";

type AllDocumentsProps = {
  workspace: string;
};

const AllDocuments: FC<AllDocumentsProps> = ({ workspace }) => {
  const [sortBy] = useQueryState("sortBy");
  const { activeView } = useActiveView();
  const { data, isFetching } = useQuery({
    queryKey: ["documents-lists", workspace, sortBy],
    queryFn: () => fetchDocuments(workspace, sortBy as SortDocumentBy),
    refetchOnWindowFocus: false,
  });
  const session = useSession();
  console.log({ w: session?.data?.user?.activeWorkspace, data });

  if (data?.data?.length === 0 && !isFetching) {
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
      data={data?.data as TGetDocument[]}
      isLoading={isFetching}
    />
  ) : (
    <DocumentListView
      data={data?.data as TGetDocument[]}
      isLoading={isFetching}
    />
  );
};

export default AllDocuments;
