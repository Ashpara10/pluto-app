import { ArrowUp, CircleStop, Plus, Square } from "lucide-react";
import React, { Dispatch, FC, SetStateAction, useRef } from "react";
import { Button } from "../ui/button";
import { UIMessage } from "ai";
import { PromptInputTextarea } from "../ai-elements/prompt-input";
import Textarea from "react-textarea-autosize";
import { cn } from "@/lib/utils";
type ChatInputProps = {
  messages: UIMessage[];
  reload?: () => void;
  isDone?: boolean;
  input: string;
  stop?: () => void;
  append?: (m: UIMessage) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: any;
  isLoading?: boolean;
  isResponseLoading?: boolean;
  setIsResponseLoading?: Dispatch<SetStateAction<boolean>>;
  setMessages?: (messages: UIMessage[]) => void;
};

const ChatInput: FC<ChatInputProps> = ({
  input,
  handleInputChange,
  handleSubmit,
  stop,
  isLoading,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <form
      onClick={() => textAreaRef.current?.focus()}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="w-full shadow-xl py-2 px-2 flex items-end justify-center border border-neutral-300 border-dark-glow overflow-hidden rounded-full"
    >
      <label
        className={cn(
          "rounded-full  size-10 flex items-center justify-center border border-neutral-300 border-dark-glow  aspect-square  cursor-pointer "
          // files.length >= 1 && "opacity-50"
        )}
        htmlFor="file-upload"
      >
        {/* <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={files.length === 1}
          id="file-upload"
        /> */}
        <Plus />
      </label>

      <Textarea
        ref={textAreaRef}
        id="chat-input"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Leave a Message..."
        className="appearance-none self-center focus-visible:outline-none resize-none w-full px-2 py-2  text-base"
        value={input}
        minRows={1}
        maxRows={1}
        onChange={handleInputChange}
      />

      <Button
        variant={"outline"}
        size={"icon"}
        disabled={isLoading || input.trim() === ""}
        className="size-10 bg-neutral-100 p-1  border-neutral-300 rounded-full flex items-center justify-center aspect-square"
      >
        <div className="bg-white dark:bg-light-dark border-dark-glow w-full border border-neutral-300 h-full rounded-full flex items-center justify-center">
          {isLoading ? (
            <Square className="size-4" />
          ) : (
            <ArrowUp className="size-4" />
          )}
        </div>
      </Button>
    </form>
  );
};

export default ChatInput;
