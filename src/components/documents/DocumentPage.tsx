"use client";
import { updateDocument } from "@/lib/db/documents";
import { queryClient } from "@/lib/session-provider";
import { GetDocumentWithTags } from "@/lib/types";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useWindowEvent } from "@mantine/hooks";
import { Loader, MoreVertical } from "lucide-react";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { IMAGE_TRANSFORMER } from "../editor/theme";
import TransitionLayout from "../TransitionLayout";
import { Button } from "../ui/button";
import Tags from "./Tags";

type DocumentPageProps = {
  document: GetDocumentWithTags;
};

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
  loading: () => <ArticleDataSkeleton />,
});

const DocumentPage: FC<DocumentPageProps> = ({ document }) => {
  const [data, setData] = useState<GetDocumentWithTags>(document);
  const [editor] = useLexicalComposerContext();
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState<string[]>(
    document?.tags?.map((t) => t.name) || []
  );

  // Sync local state when document prop changes
  useEffect(() => {
    setData(document);
    setTags(document?.tags?.map((t) => t.name) || []);
  }, [document]);

  const didTagsChanged = () => {
    const tagsWithName = data?.tags?.map((t) => t.name).sort();
    const currentTags = tags?.map((t) => t).sort();

    return (
      tagsWithName.length !== currentTags.length ||
      tagsWithName.some((t, i) => t !== currentTags[i])
    );
  };
  console.log(didTagsChanged());

  const onSave = async () => {
    setIsSaving(true);
    let payload = {
      id: data?.id as string,
      title: data?.title as string,
      markdown: "",
      content: "",
    };

    editor?.read(() => {
      const html = $generateHtmlFromNodes(editor);
      const md = $convertToMarkdownString([...TRANSFORMERS, IMAGE_TRANSFORMER]);
      console.log(md);
      payload = { ...payload, markdown: md, content: html };
    });

    const { error } = await updateDocument(payload);
    if (error) {
      setIsSaving(false);
      return toast.error(error);
    }
    // await handlePreviewImage(data?.id as string);
    setIsSaving(false);
    toast.success("Document saved successfully");
    queryClient.refetchQueries(["documents-lists"]);
  };

  useWindowEvent("keydown", (e) => {
    if (e?.code === "KeyS" && (e?.ctrlKey || e?.metaKey)) {
      e.preventDefault();
      onSave();
      return;
    }
  });

  return (
    <div className="px-4 ">
      <TransitionLayout>
        <div className="w-full flex mt-1 items-end justify-between mb-4">
          <div>
            <span className=" opacity-75">
              {new Date(data?.createdAt as Date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center justify-center gap-x-2">
            <Button size={"sm"} variant={"outline"} onClick={onSave}>
              {isSaving && (
                <Loader className="mr-2 opacity-80 size-4 animate-spin" />
              )}{" "}
              Save
            </Button>
            <Button variant={"outline"} size={"smallIcon"}>
              <MoreVertical className="opacity-80 size-4" />
            </Button>
          </div>
        </div>

        <TextareaAutosize
          autoFocus
          className="w-full focus-within:bg-neutral-50 rounded-lg leading-none md:leading-tight tracking-tight resize-none font-medium text-2xl p-2 focus-visible:outline-none bg-transparent placeholder:text-neutral-300 dark:placeholder:text-neutral-700 border-none appearance-none shadow-none overflow-hidden "
          placeholder="Enter Title..."
          value={data?.title as string}
          onChange={(e) => setData((p) => ({ ...p, title: e.target.value }))}
        />

        <hr className="h-px mt-4 dark:border-[#DCDADE]/10 w-full" />
        <Tags tags={tags} setTags={setTags} />
        <Editor
          key={data?.id} // Force remount when document changes
          className=""
          content={data?.content as string}
          setContent={(data) => setData((p) => ({ ...p, content: data }))}
          documentId={data?.id}
        />
        <div className="hidden">
          <Editor
            id="editor-dark"
            className="dark"
            content={data?.content as string}
            setContent={(data) => setData((p) => ({ ...p, content: data }))}
          />
        </div>
      </TransitionLayout>
    </div>
  );
};

const ArticleDataSkeleton = () => {
  return (
    <div className="mt-8 flex w-full items-center justify-center">
      <Loader className="animate-spin " />
    </div>
  );
};

export default DocumentPage;
