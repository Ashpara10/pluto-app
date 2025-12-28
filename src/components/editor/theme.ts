import type { ElementTransformer } from "@lexical/markdown";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { EditorThemeClasses } from "lexical";
import AssistantNode from "./nodes/AssistantNode";
import { $createImageNode, $isImageNode, ImageNode } from "./nodes/ImageNode";

export const theme: EditorThemeClasses = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  quote: "editor-quote",
  heading: {
    h1: "editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3 ",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
  },
  list: {
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
    listitem: "editor-listitem",
    listitemChecked: "PlaygroundEditorTheme__listItemChecked",
    listitemUnchecked: "PlaygroundEditorTheme__listItemUnchecked",
  },
  image: "editor-image",
  link: "editor-link",
  table: "PlaygroundEditorTheme__table",
  tableCell: "PlaygroundEditorTheme__tableCell",
  tableCellActionButton: "PlaygroundEditorTheme__tableCellActionButton",
  tableCellActionButtonContainer:
    "PlaygroundEditorTheme__tableCellActionButtonContainer",
  tableCellEditing: "PlaygroundEditorTheme__tableCellEditing",
  tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
  tableCellPrimarySelected: "PlaygroundEditorTheme__tableCellPrimarySelected",
  tableCellResizer: "PlaygroundEditorTheme__tableCellResizer",
  tableCellSelected: "PlaygroundEditorTheme__tableCellSelected",
  tableCellSortedIndicator: "PlaygroundEditorTheme__tableCellSortedIndicator",
  tableResizeRuler: "PlaygroundEditorTheme__tableCellResizeRuler",
  tableSelected: "PlaygroundEditorTheme__tableSelected",
  tableSelection: "PlaygroundEditorTheme__tableSelection",
  text: {
    bold: "editor-text-bold",
    italic: "editor-text-italic",
    overflowed: "editor-text-overflowed",
    hashtag: "editor-text-hashtag",
    underline: "editor-text-underline",
    strikethrough: "editor-text-strikethrough",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
    code: "editor-text-code",
  },
  code: "editor-code",
  codeHighlight: {
    atrule: "editor-atrule",
    attr: "editor-attr-value",
    boolean: "editor-boolean",
    builtin: "editor-builtin",
    cdata: "editor-tokenComment",
    char: "editor-char",
    class: "editor-class-name",
    "class-name": "editor-class-name",
    comment: "editor-tokenComment",
    constant: "editor-constant",
    deleted: "editor-deleted",
    doctype: "editor-tokenComment",
    entity: "editor-entity",
    function: "editor-function",
    important: "editor-important",
    inserted: "editor-inserted",
    keyword: "editor-keyword ",
    namespace: "editor-tokenVariable",
    number: "editor-number",
    operator: "editor-operator",
    prolog: "editor-tokenComment",
    property: "editor-property",
    punctuation: "editor-tokenPunctuation",
    regex: "editor-regex",
    selector: "editor-selector",
    string: "editor-string",
    symbol: "editor-symbol",
    tag: "editor-tag",
    url: "editor-url",
    variable: "editor-variable",
  },
};

export const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  CodeNode,
  ImageNode,
  // AssistantNode,
];

export const value = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "Bash Scripting Tutorial – Linux Shell Script and Command Line for Beginners",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "start",
        indent: 0,
        type: "heading",
        version: 1,
        tag: "h1",
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "In Linux, process automation relies heavily on shell scripting. This involves creating a file containing a series of commands that can be executed together.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
        textFormat: 0,
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: "In this article, we'll start with the basics of bash scripting which includes variables, commands, inputs/ outputs, and debugging. We'll also see examples of each along the way.",
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
        textFormat: 0,
      },
    ],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

export const IMAGE_TRANSFORMER: ElementTransformer = {
  type: "element",
  regExp: /!\[(.*?)\]\((.*?)\)/, // standard markdown image
  replace: (parentNode, _children, match) => {
    const [, alt, src] = match;
    parentNode.append($createImageNode({ src, altText: alt }));
  },
  export: (node) => {
    if ($isImageNode(node)) {
      return `![${node.getAltText()}](${node.getSrc()})`;
    }
    return null;
  },
  dependencies: [ImageNode],
};
