import { useCreateCollectionDialog } from "@/lib/context";
import { Button } from "./ui/button";

const EmptyCollections = () => {
  const { setCreateCollectionDialogOpen } = useCreateCollectionDialog();

  return (
    <div className="w-full h-[68vh] border-2 border-dashed flex items-center justify-center border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex max-w-xs flex-col items-center justify-center">
        <h4 className="text-lg font-medium tracking-tight leading-snug">
          No Collections found
        </h4>
        <span className="mt-1 opacity-80 leading-tight text-center">
          Creating collections to group your research papers, assignments,
          notes, and more.
        </span>
        <div className=" mt-4 flex items-center justify-center gap-4">
          <Button
            size={"sm"}
            variant={"default"}
            onClick={() => setCreateCollectionDialogOpen!(true)}
          >
            Create Collection
          </Button>
          <Button size={"sm"} variant={"outline"}>
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyCollections;
