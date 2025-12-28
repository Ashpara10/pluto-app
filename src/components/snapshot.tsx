// utils/snapshot.tsx
import { toPng } from "html-to-image";
import Editor from "./editor/editor";

import { EditorState } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { cn } from "@/lib/utils";
import { theme, nodes } from "./editor/theme";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import ParseContentPlugin from "./editor/plugins/ParseContentPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";

export function DocumentPreview({
  editorState,
  //   theme,
  className,
}: {
  editorState: string;
  //   theme: "light" | "dark";
  className: string;
}) {
  return (
    <div
      className={`p-4 rounded-lg bg-red-50 text-black dark:bg-black dark:text-white ${className}`}
    >
      <LexicalComposer
        initialConfig={{
          theme,
          nodes,
          editorState: null,
          editable: false,
          namespace: "",
          onError(error, editor) {
            console.error(error);
          },
        }}
      >
        <ParseContentPlugin content={editorState} />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={cn(
                "relative focus-visible:outline-none min-h-screen w-full overflow-hidden  pb-12 ",
                className
              )}
            />
          }
          placeholder={<div>Enter some text...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
      </LexicalComposer>
    </div>
  );
}

export async function snapshotEditorState(
  editorState: any,
  theme: "light" | "dark"
): Promise<string> {
  // Create a hidden container
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px"; // offscreen
  container.style.width = "600px"; // match your card preview size
  container.className = theme === "light" ? "theme-light" : "theme-dark";

  document.body.appendChild(container);

  // Mount Lexical editor instance into it
  // (use your existing DocumentPreview component that accepts editorState)
  const root = (
    <DocumentPreview
      editorState={editorState}
      className={theme === "light" ? "" : "dark"}
    />
  );

  // Render React into container
  // You can use ReactDOM.createRoot here
  const { createRoot } = await import("react-dom/client");
  const rootInstance = createRoot(container);
  rootInstance.render(root);

  // Wait a tick for render + Tailwind classes to apply
  await new Promise((r) => setTimeout(r, 50));

  // Snapshot as PNG
  const dataUrl = await toPng(container);

  // Cleanup
  rootInstance.unmount();
  document.body.removeChild(container);

  return dataUrl;
}
