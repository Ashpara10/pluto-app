import DocumentViewOptions from "@/components/DocumentViewOptions";
import { getCollectionDocuments } from "@/lib/actions";
import { FC } from "react";
import { Collection, Document } from "@/lib/db/schema";
import CollectionDocuments from "@/components/documents/CollectionDocuments";
import { searchParamsCache } from "@/lib/nuqs";
import { SortDocumentBy, TGetDocument } from "@/lib/types";
type PageProps = {
  params: Promise<{ workspace: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Page: FC<PageProps> = async ({ params, searchParams }) => {
  console.log(params);
  const { q: query } = await searchParamsCache.parse(searchParams);
  const { slug, workspace } = await params;
  const { data, error } = await getCollectionDocuments({
    slug,
    workspace,
    sortBy: query as SortDocumentBy,
  });

  return (
    <div className="flex w-full flex-col items-center justify-center  pt-28 px-4">
      <div className="w-full max-w-7xl">
        <DocumentViewOptions
          title={`${data?.collection?.name} Documents`}
          isCollectionDocumentsPage={true}
          collectionSlug={slug}
        >
          <CollectionDocuments
            initialData={
              data as { documents: TGetDocument[]; collection: Collection }
            }
            slug={slug}
            workspace={workspace}
          />
        </DocumentViewOptions>
      </div>
    </div>
  );
};

export default Page;
