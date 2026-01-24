"use client";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $getRoot, LexicalEditor } from "lexical";
import { useEffect, useRef } from "react";
import EditorPlugins from "./plugins";
import ParseContentPlugin from "./plugins/ParseContentPlugin";
import { cn } from "@/lib/utils";

interface EditorProps {
  id?: string;
  className?: string;
  content: string;
  setContent?: (data: string) => void;
  documentId?: string; // For block-level persistence
}

function Editor({ content, setContent, id, className, documentId }: EditorProps) {
  const editor = useRef<LexicalEditor>(null);

  useEffect(() => {
    const root = editor.current?.getEditorState().read(() => {
      const root = $getRoot();
      return root.getChildren().map((n) => n.getType());
    });
    console.log("Current nodes:", root);
  }, []);

  return (
    <>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            id={id || "editor"}
            className={cn(
              "relative focus-visible:outline-none min-h-screen w-full overflow-hidden  pb-12 ",
              className
            )}
          />
        }
        placeholder={<div>Enter some text...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />

      <ParseContentPlugin content={content!} setContent={setContent} />
      <EditorPlugins documentId={documentId} />
      <EditorRefPlugin editorRef={editor} />
    </>
  );
}
export default Editor;
