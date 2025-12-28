import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  AlarmClock,
  Calendar,
  Clock,
  Grid2x2,
  LayoutGrid,
  List,
  Star,
} from "lucide-react";
import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useQueryState } from "nuqs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useActiveView } from "@/lib/context";

type DocumentFilterOptionsProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactNode;
  view: string;
  onViewChange: (view: string) => void;
};

const DocumentFilterOptions: FC<DocumentFilterOptionsProps> = ({
  open,
  setOpen,
  children,
  view,
  onViewChange,
}) => {
  const [sortBy, setSortBy] = useQueryState("sortBy");
  const { activeView } = useActiveView();
  const sort_options = [
    {
      icon: <Star className="size-5 opacity-80" />,
      name: "Favourite",
      key: "favourites",
    },
    {
      icon: <AlarmClock className="size-5 opacity-80" />,
      name: "Created",
      key: "createdAt",
    },
    {
      icon: <Calendar className="size-5 opacity-80" />,
      name: "Updated",
      key: "updatedAt",
    },
  ];

  const view_options = [
    { key: "grid", icon: <Grid2x2 className="size-5 opacity-80" /> },
    { key: "list", icon: <List className="size-5 opacity-80" /> },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="border  p-0 mr-3 border-neutral-200/60  bg-white  dark:border-neutral-600 dark:bg-neutral-800/90 backdrop-blur-lg mt-2 ">
        <div className="space-y-4">
          <div className="space-y-2 ">
            <motion.div
              layout
              className="flex space-x-2 relative w-full px-3 pb-1 pt-2"
            >
              {view_options.map((option, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => onViewChange(option?.key)}
                    className={cn(
                      "w-full cursor-pointer relative border rounded-lg dark:border-neutral-600 border-neutral-200/60  h-[50px] flex items-center justify-center px-4",
                      activeView === option?.key && "border-none"
                    )}
                  >
                    {option?.icon}
                    {activeView === option?.key && (
                      <motion.div
                        layoutId="bubble"
                        className="mix-blend-difference inset-0 rounded-lg  absolute bg-black dark:bg-black/50 "
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
            <Separator />
            <Separator />

            <motion.div layout className="w-full flex flex-col">
              {sort_options.map((option, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (sortBy === option.key) {
                        setSortBy(null);
                        return;
                      }
                      setSortBy(option.key);
                    }}
                    className={cn(
                      "w-full relative flex cursor-pointer items-center justify-start px-4 py-1.5 first-line:border-none border-t border-neutral-300/60 dark:border-neutral-600 "
                    )}
                  >
                    {option?.icon}
                    <span
                      className={cn(
                        "ml-2 opacity-80  text-sm",
                        sortBy === option?.key && "opacity-100"
                      )}
                    >
                      {" "}
                      {option?.name}
                    </span>
                    {sortBy === option.key && (
                      <motion.div
                        layoutId="selected"
                        className="mix-blend-difference inset-[0.5px] rounded-lg  absolute bg-black dark:bg-black/50 "
                      />
                    )}
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DocumentFilterOptions;
