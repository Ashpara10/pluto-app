import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import React from "react";

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>((props) => {
  const { placeholder, tags, setTags, className } = props;

  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim().split(" ").join("-").toLocaleLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="mt-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={cn(
          className,
          " focus-visible:outline-none focus-visible:ring-0"
        )}
      />
      <div
        className={`mt-2 flex flex-wrap gap-2 rounded-md ${
          tags.length !== 0 && "mb-3"
        }`}
      >
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex h-8 items-center rounded-md
					bg-black/5 pl-2 text-sm text-gray transition-all dark:bg-white/5 dark:text-lightGray"
          >
            {/* <div className="mr-1 size-3 rounded-full bg-green-500"></div> */}
            {tag}
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeTag(tag)}
              className={cn("h-full px-3 py-1 hover:bg-transparent")}
            >
              <X size={14} />
            </Button>
          </span>
        ))}
      </div>
    </div>
  );
});

TagInput.displayName = "TagInput";

export { TagInput };
