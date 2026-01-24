import AllDocuments from "@/components/documents/AllDocuments";
import DocumentViewOptions from "@/components/DocumentViewOptions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchDocuments } from "@/lib/actions";
import { TGetDocument } from "@/lib/types";
import { createLoader, parseAsString } from "nuqs";
import { FC } from "react";

type PageProps = {
  params: Promise<{ workspace: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const Page: FC<PageProps> = async ({ params, searchParams }) => {
  const sortBy = (await searchParams)?.sortBy as string;

  const documents = await fetchDocuments(
    (
      await params
    )?.workspace,
    sortBy as any
  );
  if (documents?.error) {
    throw new Error(documents?.error);
  }
  return (
    <div className="size-full ">
      {/* mx-auto max-w-5xl px-2 pb-10 mt-10 */}
      {/* <DocumentViewOptions title="All Documents"> */}
      <AllDocuments
        initialData={documents?.data as TGetDocument[]}
        workspace={(await params).workspace}
      />
      {/* </DocumentViewOptions> */}
    </div>
    // </div>
  );
};
// <div className="flex w-full h-screen flex-col items-center justify-center ">
{
  /* <ScrollArea className="w-full h-full overflow-y-auto "> */
}
{
  /* </ScrollArea> */
}

export default Page;
