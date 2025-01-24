import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useWorkspaceDialog } from "@/lib/context";
import Image from "next/image";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { createWorkspace } from "@/lib/db/workspaces";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { queryClient } from "@/lib/session-provider";
import { Loader } from "lucide-react";

const CreateWorkspaceDialogSchema = z.object({
  title: z.string().max(30).min(6),
});

const CreateWorkspace = () => {
  const { isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen } =
    useWorkspaceDialog();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof CreateWorkspaceDialogSchema>>({
    defaultValues: {
      title: "",
    },
    resolver: zodResolver(CreateWorkspaceDialogSchema),
  });
  const { data: user } = useSession();
  const values = getValues();
  const watchTitle = watch("title");

  const workspaceImage = useMemo(() => {
    if (watchTitle === "")
      return "https://api.dicebear.com/9.x/glass/svg?seed=Untitled-Workspace";
    return `https://api.dicebear.com/9.x/glass/svg?seed=${watchTitle?.toLocaleLowerCase()}`;
  }, [watchTitle]);
  return (
    <Dialog
      open={isCreateWorkspaceDialogOpen}
      onOpenChange={setIsCreateWorkspaceDialogOpen}
    >
      <DialogContent
        style={{ borderRadius: 30 }}
        className="w-full border border-neutral-300/60 dark:border-lightGray/10 max-w-md  p-0 overflow-hidden bg-neutral-100 backdrop-blur-2xl dark:bg-neutral-900"
      >
        <DialogHeader className=" border-b border-neutral-300/60 dark:border-lightGray/10  px-8 pt-6 pb-4">
          <DialogTitle className="text-xl font-medium tracking-tight leading-tight">
            Create Workspace
          </DialogTitle>
          <DialogDescription>
            A Workspace is a virtual space where you can collaborate, create and
            plan with your team.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 px-8 mb-8">
          <form
            className="block w-full"
            onSubmit={handleSubmit(async ({ title }) => {
              const { data, error } = await createWorkspace({
                image: workspaceImage,
                name: title,
              });
              if (error) {
                toast.error("Failed to create workspace" + error);
                return;
              }
              toast.success(`Workspace ${data?.name} created successfully`);
              setIsCreateWorkspaceDialogOpen!(false);
              await queryClient.refetchQueries(["get-workspaces"]);
            })}
          >
            <label>
              <Image
                className="size-14 rounded-lg "
                width={56}
                height={56}
                src={workspaceImage}
                alt={`workspace-${values?.title}`}
              />
            </label>
            <input type="file" className="hidden" id="workspace-image-input" />
            <div className="mt-2">
              <Label className=" font-medium leading-tight tracking-tight">
                Workspace name
              </Label>
              <Input
                placeholder="Set Workspace name"
                className={cn(
                  "mt-1 placeholder:text-xs placeholder:opacity-70 bg-neutral-200 dark:bg-neutral-950/30 border border-neutral-300/60 dark:border-lightGray/10",
                  errors?.title && "focus-visible:ring-red-600/70"
                )}
                {...register("title")}
              />
              {errors?.title && (
                <span className="text-red-600 text-sm mt-2">
                  {errors?.title?.message}
                </span>
              )}
            </div>
            <div className="mt-3">
              <Button
                className="w-full rounded-lg flex items-center justify-center"
                type="submit"
              >
                {isSubmitting && (
                  <Loader className="size-4 animate-spin opacity-80 mr-2" />
                )}
                Create Workspace
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspace;
