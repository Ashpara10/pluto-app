import { createDocument } from "@/lib/db/documents";
import { queryClient } from "@/lib/session-provider";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { $generateNodesFromDOM } from "@lexical/html";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection } from "lexical";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ScrollArea } from "../ui/scroll-area";
import ChatInput from "./chat-input";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Copy,
  CopyCheckIcon,
  CopyIcon,
  FilePlus2,
  PanelLeft,
  Plus,
  RefreshCcw,
  RefreshCcwIcon,
} from "lucide-react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { DefaultChatTransport, UIMessage } from "ai";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import { Action, Actions } from "../ai-elements/actions";
import { useSelectedDocuments } from "@/lib/context";
import DocumentCardItem from "../documents/DocumentCard";
import { TGetDocument } from "@/lib/types";
import { Document } from "@/lib/db/schema";

type TChatAssistantProps = {
  handleCollapse: () => void;
  isCollapsed: boolean;
};

const ChatAssistant = ({
  handleCollapse,
  isCollapsed,
}: TChatAssistantProps) => {
  const chatInputContainerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [mdContext, setMdContext] = useState("");
  const [editor] = useLexicalComposerContext();
  const [input, setInput] = useState("");
  const { selectedDocuments } = useSelectedDocuments();
  const selectedDocumentsRef = useRef(selectedDocuments);

  useEffect(() => {
    selectedDocumentsRef.current = selectedDocuments;
  }, [selectedDocuments]);
  console.log({ selectedDocuments });

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        prepareSendMessagesRequest: ({ id, messages }) => {
          return {
            body: {
              selected: selectedDocumentsRef.current,
              messages,
            },
          };
        },
      }),
    [] // No dependency, always uses latest via ref
  );
  const { regenerate, messages, sendMessage, status, stop } = useChat({
    transport,
  });
  const isAnswering = status === "streaming";

  useEffect(() => {
    return editor?.update(() => {
      const md = $convertToMarkdownString(TRANSFORMERS);
      console.log({ md });
      setMdContext(md);
    });
  }, [editor, messages, input]);

  useEffect(() => {
    chatRef.current?.scrollIntoView(false);
  }, [messages]);

  return (
    <div className={cn("w-full h-full flex flex-col")}>
      <div className="w-full gap-x-2 pb-2 pt-4 px-4 flex items-center justify-end">
        <Button size={"sm"} className="py-1 px-2 rounded-lg" variant={"ghost"}>
          <Plus className="size-4" />
          <span className="tracking-tight font-medium ml-2">New chat</span>
        </Button>
        <Button
          onClick={handleCollapse}
          size={"smallIcon"}
          className="rounded-lg"
          variant={"ghost"}
        >
          <PanelLeft className="size-4" />
        </Button>
      </div>
      <ScrollArea
        className={cn(" flex relative h-full  w-full flex-col px-4   ")}
      >
        <div className={cn("flex mt-6 mb-10 w-full flex-col space-y-3")}>
          {messages.map((message, messageIndex) => {
            return (
              <Message className="w-full" from={message.role} key={message.id}>
                <MessageContent
                  className={cn(
                    message.role === "assistant" && "max-w-full w-full"
                  )}
                >
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "tool-createDocument":
                        if (part.output) {
                          return <div>{(part.output.data as any)?.title}</div>;
                        }
                        return <>Creating New Document</>;
                      case "text":
                        const isLastMessage =
                          messageIndex === messages.length - 1;

                        return (
                          <div key={`${message.id}-${i}`}>
                            <Response className="prose-h1:text-lg prose-headings:font-medium prose-headings:tracking-tight">
                              {part.text}
                            </Response>
                            {message.role === "assistant" && isLastMessage && (
                              <Actions className="mt-2">
                                <Action
                                  onClick={() => regenerate()}
                                  label="Retry"
                                >
                                  <RefreshCcwIcon className="size-3" />
                                </Action>
                                <Action
                                  onClick={() =>
                                    navigator.clipboard.writeText(part.text)
                                  }
                                  label="Copy"
                                >
                                  <CopyIcon className="size-3" />
                                </Action>
                              </Actions>
                            )}
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            );
          })}
        </div>
      </ScrollArea>
      <div ref={chatInputContainerRef} className="mb-2 px-2 z-10 h-fit w-full">
        <ChatInput
          input={input}
          handleInputChange={(e) => setInput(e.target.value)}
          handleSubmit={() => {
            sendMessage({ parts: [{ type: "text", text: input }] });
            setInput(""); // Optionally clear input after sending
          }}
          messages={messages}
          stop={stop}
          isLoading={isAnswering}
        />
      </div>
      {/* </div> */}
    </div>
  );
};

export default ChatAssistant;
{
  /* {messages.map((message, index) => {
  return message?.role === "user" ? (
    <Card
      key={index}
      className="w-fit max-w-[70%] self-end rounded-2xl bg-white dark:bg-neutral-800"
    >
      <CardContent className=" px-5 py-3 leading-tight ">
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return (
                <div key={`${message.id}-${i}`}>{part.text}</div>
              );
          }
        })}
      </CardContent>
    </Card>
  ) : (
    <>
      <Card key={index} className="dark:bg-neutral-800">
        <CardContent className="py-6 ">
          {message.parts.map((part, i) => {
            switch (part.type) {
              case "text":
                const content = unified()
                  .use(remarkParse)
                  .use(remarkGfm)
                  .use(remarkRehype)
                  .use(rehypeStringify)
                  .processSync(part?.text);
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="prose dark:prose-invert prose-strong:font-medium prose-strong:tracking-tight prose-headings:font-medium prose-headings:tracking-tight leading-snug "
                    dangerouslySetInnerHTML={{
                      __html: content.toString(),
                    }}
                  />
                );
            }
          })}
        </CardContent>
      </Card>
      <div
        className={cn(
          "mt-2 transition-all mb-4 flex items-center justify-end gap-x-2 w-full"
        )}
      >
        <Button
          // onClick={() => addBlockToEditor(content?.toString())}
          variant={"outline"}
          size={"smallIcon"}
          className="cursor-pointer rounded-lg"
        >
          <Plus className="opacity-80 size-4" />
        </Button>
        <Button
          // onClick={() => handleCopyBlock(content?.toString())}
          variant={"outline"}
          size={"smallIcon"}
          className="cursor-pointer rounded-lg"
        >
          {isCopied ? (
            <CopyCheckIcon className="opacity-80 size-4" />
          ) : (
            <Copy className="opacity-80 size-4" />
          )}
        </Button>
        <Button
          onClick={async () => {
            // const title = message?.parts[0]?.type===
            //   .split("\n")[0]
            //   .slice(2, message.content.split("\n")[0].length);
            // await createDocumentFromResponse({
            //   content: content?.toString(),
            //   markdown: message?.content,
            //   title: title,
            // });
          }}
          variant={"outline"}
          size={"smallIcon"}
          className="cursor-pointer rounded-lg"
        >
          <FilePlus2 className="opacity-80 size-4" />
        </Button>
        <Button
          onClick={() => regenerate()}
          variant={"outline"}
          size={"smallIcon"}
          className="cursor-pointer rounded-lg"
        >
          <RefreshCcw className="opacity-80 size-4" />
        </Button>
      </div>
    </>
  );
})} */
}

// const addBlockToEditor = (block: string) => {
//   editor.update(() => {
//     const parser = new DOMParser();
//     const dom = parser.parseFromString(block as string, "text/html");
//     const blocks = $generateNodesFromDOM(editor, dom);
//     $getSelection()?.insertNodes(blocks);
//   });
// };

// const handleCopyBlock = (block: string) => {
//   setIsCopied(true);
//   navigator.clipboard.writeText(block);
//   toast.success("Copied to clipboard");

//   setTimeout(() => {
//     setIsCopied(false);
//   }, 2000);
// };

// const createDocumentFromResponse = async ({
//   content,
//   markdown,
//   title,
// }: {
//   content: string;
//   markdown: string;
//   title: string;
// }) => {
//   const doc = await createDocument({
//     content: content,
//     markdown: markdown,
//     title: title,
//   });
//   if (doc?.error) {
//     toast.error(doc.error);
//     return;
//   }
//   toast.success("Document created successfully");
//   await queryClient.refetchQueries([
//     "documents-lists",
//     session?.data?.user?.activeWorkspace?.slug,
//     sortBy,
//   ]);
//   router.push(
//     `${session?.data?.user?.activeWorkspace?.slug}/document/${doc?.data?.id}`
//   );
// };
