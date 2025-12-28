import { instance } from "@/lib/axios";
import { useCreateCollectionDialog } from "@/lib/context";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { TagInput } from "../ui/tag-input";
import { Label } from "../ui/label";
import { queryClient } from "@/lib/session-provider";
import { useParams } from "next/navigation";

const CreateCollectionPayloadSchema = z.object({
  name: z.string(),
});

const CreateCollectionDialog = () => {
  const { currentWorkspace } = useWorkspaces();
  const { createCollectionDialogOpen, setCreateCollectionDialogOpen } =
    useCreateCollectionDialog();

  const { register, handleSubmit, reset } = useForm<
    z.infer<typeof CreateCollectionPayloadSchema>
  >({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(CreateCollectionPayloadSchema),
  });
  const [tags, setTags] = React.useState<string[]>([]);
  const { workspace } = useParams();
  return (
    <Dialog
      open={createCollectionDialogOpen}
      onOpenChange={setCreateCollectionDialogOpen}
    >
      <DialogContent
        style={{ borderRadius: 30 }}
        className="w-full border border-neutral-300/60 dark:border-neutral-600 max-w-md  p-0 overflow-hidden bg-neutral-100 backdrop-blur-2xl dark:bg-neutral-900"
      >
        <DialogHeader className=" border-b border-neutral-300/60 dark:border-neutral-600  px-8 pt-6 pb-4">
          <DialogTitle className="text-xl font-medium tracking-tight leading-tight">
            Create Collection
          </DialogTitle>
          <DialogDescription>
            Creating collections to group your research papers, assignments,
            notes, and more.{" "}
          </DialogDescription>
        </DialogHeader>
        <div className="w-full  px-8 pt-2 pb-8">
          <form
            className="flex flex-col"
            onSubmit={handleSubmit(async (values) => {
              try {
                const resp = await instance.post(
                  "/collection",
                  {
                    name: values?.name,
                    tags: tags,
                    documents: null,
                  },
                  {
                    params: {
                      workspace: currentWorkspace?.id,
                    },
                  }
                );
                if (resp.status !== 201) {
                  toast.error(JSON.stringify(resp?.data));
                  return;
                }
                toast.success("Collection created successfully");
                reset();
                setTags([]);
                queryClient.refetchQueries(["all-collections", workspace]);
              } catch (error) {
                if (error instanceof AxiosError) {
                  console.log(error);
                  toast.error(error?.response?.data?.message);
                }
              }
            })}
          >
            <Label className="mb-2 mt-2">Collection Name</Label>
            <Input
              className=" py-2"
              {...register("name")}
              placeholder="Enter collection name"
            />
            <Label className="mt-4 ">Collection Tags</Label>
            <TagInput
              tags={tags}
              className="mt-1"
              placeholder="Select Tags..."
              setTags={setTags}
            />
            <Button variant={"default"} className="mt-2 w-full">
              Create Collection
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionDialog;
