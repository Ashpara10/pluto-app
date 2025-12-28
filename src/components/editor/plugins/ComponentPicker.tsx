/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { cn } from "@/lib/utils";
import { $createCodeNode } from "@lexical/code";
import { generateText, streamText } from "ai";
import google from "@/lib/ai";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  ElementNode,
  TextNode,
} from "lexical";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  List,
  ListChecks,
  ListOrdered,
  Sparkles,
  Text,
  TextQuote,
} from "lucide-react";
import { JSX, useCallback, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";
import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import { INSERT_ASSISTANT_RESPONSE } from "./AskAssistantPlugin";

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // A longer description of this option
  description: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    description: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    }
  ) {
    super(title);
    this.title = title;
    this.description = description;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "flex w-full items-center space-x-2 rounded-md p-1 text-left text-sm  hover:bg-[#383838] ",
        isSelected && "bg-[#424242]"
      )}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#383838]   text-white antialiased">
        {option.icon}
      </div>
      <div>
        <p className="font-medium text-white">{option.title}</p>
        <p className="text-xs text-white/70">{option.description}</p>
      </div>
    </li>
  );
}

export default function ComponentPickerPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const getDynamicOptions = useCallback(() => {
    const options: Array<ComponentPickerOption> = [];

    if (queryString == null) {
      return options;
    }

    const fullTableRegex = new RegExp(/^([1-9]|10)x([1-9]|10)$/);
    const partialTableRegex = new RegExp(/^([1-9]|10)x?$/);

    const fullTableMatch = fullTableRegex.exec(queryString);
    const partialTableMatch = partialTableRegex.exec(queryString);

    if (fullTableMatch) {
      const [rows, columns] = fullTableMatch[0]
        .split("x")
        .map((n: string) => parseInt(n, 10));

      options.push(
        new ComponentPickerOption(
          `${rows}x${columns} Table`,
          "Add simple tabular content to your page",
          {
            icon: <i className="icon table" />,
            keywords: ["table"],
            onSelect: () =>
              // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
          }
        )
      );
    } else if (partialTableMatch) {
      const rows = parseInt(partialTableMatch[0], 10);

      options.push(
        ...Array.from({ length: 5 }, (_, i) => i + 1).map(
          (columns) =>
            new ComponentPickerOption(
              `${rows}x${columns} Table`,
              "Add simple tabular content to your page",
              {
                icon: <i className="icon table" />,
                keywords: ["table"],
                onSelect: () =>
                  // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
                  editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                    // @ts-ignore
                    columns,
                    // @ts-ignore
                    rows,
                  }),
              }
            )
        )
      );
    }

    return options;
  }, [editor, queryString]);

  const options = useMemo(() => {
    const HEADINGS = ["Big", "Medium", "Small"];
    const HEADING_ICONS = [
      <Heading1 key="icon_heading_1" size={18} />,
      <Heading2 key="icon_heading_2" size={18} />,
      <Heading3 key="icon_heading_3" size={18} />,
    ];
    const baseOptions = [
      new ComponentPickerOption(
        "Ask Assistant",
        "Use AI Assistant to generate content",
        {
          icon: <Sparkles size={18} />,
          keywords: ["ai", "ask", "ask ai", "assistant", "copilot"],
          onSelect: async () => {
            const query = prompt("Ask Assistant?");
            console.log(query);
            if (query === null) return;
            editor.dispatchCommand(INSERT_ASSISTANT_RESPONSE, query);
          },
        }
      ),
      new ComponentPickerOption("Text", "Just start typing with plain text.", {
        icon: <Text size={18} />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          });
        },
      }),
      ...Array.from({ length: 3 }, (_, i) => i + 1).map(
        (n) =>
          new ComponentPickerOption(
            `Heading ${n}`,
            `${HEADINGS[n - 1]} section heading.`,
            {
              icon: HEADING_ICONS[n - 1],
              keywords: ["heading", "header", `h${n}`],
              onSelect: () =>
                editor.update(() => {
                  const selection = $getSelection();
                  if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () =>
                      // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
                      $createHeadingNode(`h${n}`)
                    );
                  }
                }),
            }
          )
      ),

      new ComponentPickerOption("Todo List", "Create a check list.", {
        icon: <ListChecks size={18} />,
        keywords: ["todo list", "check list", "check"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption(
        "Numbered List",
        "Create a list with numbering.",
        {
          icon: <ListOrdered size={18} />,
          keywords: ["numbered list", "ordered list", "ol"],
          onSelect: () =>
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
        }
      ),
      new ComponentPickerOption(
        "Bulleted List",
        "Create a simple bullet list.",
        {
          icon: <List size={18} />,
          keywords: ["bulleted list", "unordered list", "ul"],
          onSelect: () =>
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
        }
      ),
      new ComponentPickerOption("Image", "Insert an image", {
        icon: <ImagePlus size={18} />,
        keywords: ["image", "photo", "attachment"],
        onSelect: () => {
          const src = prompt("Enter Image URL");
          if (!src) {
            alert("Please enter a valid URL");
            return;
          }
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: "",
            src: src,
          });
        },
      }),

      new ComponentPickerOption("Quote", "Capture a quote.", {
        icon: <TextQuote size={18} />,
        keywords: ["block quote"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          }),
      }),
      new ComponentPickerOption("Code", "Capture a code snippet.", {
        icon: <Code size={18} />,
        keywords: ["javascript", "python", "js", "codeblock"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          }),
      }),
      new ComponentPickerOption("Table", "Create a Table ", {
        icon: <Code size={18} />,
        keywords: ["table"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              editor.dispatchCommand(INSERT_TABLE_COMMAND, {
                columns: "6",
                rows: "4",
              });
            }
          }),
      }),
    ];

    const dynamicOptions = getDynamicOptions();

    return queryString
      ? [
          ...dynamicOptions,
          ...baseOptions.filter((option) => {
            return new RegExp(queryString, "gi").exec(option.title) ||
              option.keywords != null
              ? option.keywords.some((keyword: string) =>
                  new RegExp(queryString, "gi").exec(keyword)
                )
              : false;
          }),
        ]
      : baseOptions;
  }, [editor, getDynamicOptions, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove();
        }
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <div
                  className={cn(
                    "absolute z-50 mt-8 h-auto max-h-[330px] w-72 overflow-y-hidden scroll-smooth  rounded-lg px-1 py-2 shadow-md shadow-black/10 transition-all",
                    "scrollbar-thin border border-[#DCDADE] bg-dark-popover dark:border-[#DCDADE]/20 "
                  )}
                >
                  <ul className="flex flex-col gap-2">
                    {options.map((option, i: number) => (
                      <ComponentPickerMenuItem
                        index={i}
                        isSelected={selectedIndex === i}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        key={option.key}
                        option={option}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  );
}
