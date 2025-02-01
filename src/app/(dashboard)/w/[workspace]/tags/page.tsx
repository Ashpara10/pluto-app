"use client";
import DocumentCardView from "@/components/documents/DocumentCardView";
import DocumentListView from "@/components/documents/DocumentListView";
import DocumentViewOptions from "@/components/DocumentViewOptions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useActiveView } from "@/lib/context";
import { getDocumentsGroupedByTag } from "@/lib/db/documents";
import { Document } from "@/lib/db/schema";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useQuery } from "react-query";

const Page = () => {
  const { activeView } = useActiveView();
  const { data: docs, isLoading } = useQuery(["group-documents-by-tags"], () =>
    getDocumentsGroupedByTag()
  );

  console.log({ docs });
  function toUppercase(str: string) {
    return str
      .split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }
  return (
    <section className="w-full flex flex-col items-center justify-center mt-28  mb-28">
      <DocumentViewOptions
        documentsContainerClassName={cn("px-0 w-full", isLoading && "px-2")}
        title="Tags"
      >
        <Accordion type="multiple" className="w-full ">
          {(docs as any[])?.map((doc, i) => {
            const name = doc.tag.split("-").join(" ");
            return (
              <AccordionItem
                className="w-full border-y border-neutral-300 dark:border-lightGray/10 py-2"
                value={`tags-${doc?.tag}`}
                key={doc.tag}
              >
                <AccordionTrigger className="text-base border-neutral-300 font-medium dark:border-lightGray/10 px-4 lg:px-6 py-3">
                  {toUppercase(name)} ({doc?.documents?.length})
                </AccordionTrigger>
                <AccordionContent className="data-[state='open']:border-t border-0 border-neutral-300 dark:border-lightGray/10 border-t py-4 px-2 flex flex-col items-center justify-start">
                  {activeView === "list" ? (
                    <DocumentListView
                      isLoading={isLoading}
                      data={doc?.documents}
                    />
                  ) : (
                    <DocumentCardView
                      data={doc?.documents}
                      isLoading={isLoading}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </DocumentViewOptions>
    </section>
  );
};

export default Page;
