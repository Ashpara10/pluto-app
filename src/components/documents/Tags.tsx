import React from "react";
import { TagInput } from "../ui/tag-input";

type TagsProps = {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
};

const Tags = ({ tags, setTags }: TagsProps) => {
  return (
    <div className="w-full mt-4">
      <TagInput tags={tags} className="w-full" setTags={setTags} />
    </div>
  );
};

export default Tags;
