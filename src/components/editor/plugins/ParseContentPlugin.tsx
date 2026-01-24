"use client";
import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";
import { FC, useEffect } from "react";

type TParseContentPlugin = {
  content?: string;
  isHtmlcontent?: boolean;
  setContent?: any;
};

const ParseContentPlugin: FC<TParseContentPlugin> = ({ content }) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Skip if no content
    if (!content) {
      // Clear editor if content is empty
      editor?.update(() => {
        $getRoot().clear();
      });
      return;
    }

    // Parse and insert content whenever it changes
    editor?.update(() => {
      const parser = new DOMParser();
      const state = parser.parseFromString(content, "text/html");
      const nodes = $generateNodesFromDOM(editor, state);

      // Clear existing content and insert new nodes
      $getRoot().clear().select();
      $insertNodes(nodes);
    });
  }, [content, editor]); // Only depend on content and editor

  return <></>;
};

export default ParseContentPlugin;
