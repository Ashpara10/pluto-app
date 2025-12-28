import { TRANSFORMERS as MDTRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { MATCHERS } from "./AutoLinkPlugin";
import { CheckListPlugin } from "./CheckListPlugin";
import CodeHighlightPlugin from "./CodeHighlightPlugin";
import ComponentPickerPlugin from "./ComponentPicker";
import DragDropPlugin from "./DragDropPlugin";
import ImagesPlugin from "./ImagePlugin";
import ListMaxIndentLevelPlugin from "./ListIndentPlugin";
import TableCellResizerPlugin from "./TableResizePlugin";
// import AskAssistantPlugin from "./AskAssistantPlugin";

const EditorPlugins = () => {
  return (
    <>
      <ComponentPickerPlugin />
      <AutoLinkPlugin matchers={MATCHERS} />
      <CodeHighlightPlugin />
      <ListMaxIndentLevelPlugin maxDepth={3} />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ImagesPlugin />
      <DragDropPlugin />
      <CheckListPlugin />
      <TablePlugin />
      <TableCellResizerPlugin />
      {/* <AskAssistantPlugin /> */}
      <MarkdownShortcutPlugin transformers={MDTRANSFORMERS} />
    </>
  );
};

export default EditorPlugins;
