"use client";

import { fetchDocuments } from "@/lib/actions";
import { useActiveView } from "@/lib/context";
import { SortDocumentBy, TGetDocument } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useQueryState } from "nuqs";
import { FC } from "react";
import { useQuery } from "react-query";
import EmptyDocuments from "../empty-documents";
import DocumentCardView, { DocumentCardViewSkeleton } from "./DocumentCardView";
import DocumentListView, { DocumentListViewSkeleton } from "./DocumentListView";
import DocumentCanvas from "./DocumentCanvas";

type AllDocumentsProps = {
  workspace: string;
  initialData: TGetDocument[];
};

const AllDocuments: FC<AllDocumentsProps> = ({ workspace, initialData }) => {
  const [sortBy] = useQueryState("sortBy");
  const { activeView } = useActiveView();
  const { data, isLoading } = useQuery({
    queryKey: ["documents-lists", workspace, sortBy],
    queryFn: async () => {
      const data = await fetchDocuments(workspace, sortBy as SortDocumentBy);
      if (data?.error) {
        throw new Error(data.error);
      }
      return data?.data;
    },
    initialData: initialData,
    refetchOnWindowFocus: false,
  });
  const session = useSession();
  console.log({ w: session?.data?.user?.activeWorkspace, data });

  if (data?.length === 0 && !isLoading) {
    return <EmptyDocuments />;
  }

  if (isLoading) {
    return activeView === "list" ? (
      <DocumentListViewSkeleton />
    ) : (
      <DocumentCardViewSkeleton />
    );
  }
  return <DocumentCanvas documents={data as TGetDocument[]} isLoading={isLoading} />

  // return activeView === "grid" ? (
  //   <DocumentCardView data={data as TGetDocument[]} isLoading={isLoading} />
  // ) : (
  //   <DocumentListView data={data as TGetDocument[]} isLoading={isLoading} />
  // );
};

export default AllDocuments;
