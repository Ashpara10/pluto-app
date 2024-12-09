"use client";
import React, { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { Document } from "@/lib/db/schema";
import { Button } from "../ui/button";
import { Star, Trash2 } from "lucide-react";

type DocumentListProps = {
  document: Document;
  checked?: boolean;
  handleCheckChange: (checked: boolean, id: string) => void;
};

const DocumentListItem = ({
  document,
  checked,
  handleCheckChange,
}: DocumentListProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { workspace } = useParams();
  const handleClick = () => {
    router.push(`/w/${workspace}/document/${document.id}`);
  };
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="px-2 rounded-lg py-0.5 hover:dark:bg-lightGray/5 hover:bg-neutral-200/60 flex w-full items-center justify-start truncate"
    >
      <Checkbox
        checked={checked}
        className={cn(`data-[state=checked]:bg-violet-600`)}
        onCheckedChange={(checked) => {
          handleCheckChange(checked as boolean, document?.id);
        }}
      />
      <div className="w-full flex items-center justify-between">
        <div className="ml-2 flex items-center justify-start">
          <span
            onClick={handleClick}
            className="truncate text-lg max-w-md leading-tight tracking-tight hover:cursor-pointer "
          >
            {document?.title || "Untitled"}
          </span>
          <span className="ml-2 text-sm opacity-80">
            {new Date(document?.createdAt)?.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
          </span>
        </div>
        <div
          className={cn(
            "flex invisible items-center justify-center gap-x-1 ",
            isHovered && "visible"
          )}
        >
          <button className="p-1 rounded-lg hover:dark:bg-lightGray/10 hover:bg-neutral-200/30">
            <Star strokeWidth={1.07} className="opacity-80 size-5" />
          </button>
          <button className="p-1 rounded-lg hover:dark:bg-lightGray/10 hover:bg-neutral-200/30">
            <Trash2 strokeWidth={1.07} className="opacity-80 size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentListItem;
