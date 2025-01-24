"use client";
import { createWorkspace } from "@/lib/db/workspaces";
import { queryClient } from "@/lib/session-provider";
import { capitalizeFirstLetter } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const NewWorkspaceSchema = z.object({
  name: z.string().min(6).max(30),
});

const CreateWorkspace = () => {
  const router = useRouter();
  const { data: user, update } = useSession();
  const workspaceName =
    user?.user?.name &&
    `${capitalizeFirstLetter(
      user?.user?.name?.split(" ")[0] as string
    )}'s Personal Workspace`;

  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
    },
    values: {
      name: workspaceName,
    },
    resolver: zodResolver(NewWorkspaceSchema),
  });
  const watchTitle = watch("name");

  const workspaceImage = useMemo(() => {
    if (watchTitle === "")
      return "https://api.dicebear.com/9.x/glass/svg?seed=Untitled-Workspace";
    return `https://api.dicebear.com/9.x/glass/svg?seed=${watchTitle?.toLocaleLowerCase()}`;
  }, [watchTitle]);

  const handleFormSubmit = handleSubmit(async (values) => {
    const { data, error } = await createWorkspace({
      image: workspaceImage,
      name: values?.name as string,
    });
    if (error && !data) {
      toast.error("Failed to create workspace" + error);
      return;
    }
    toast.success("Workspace created successfully");
    const w = {
      id: data?.id,
      name: data?.name,
      slug: data?.slug,
    };
    await update({ ...user, user: { ...user?.user, activeWorkspace: w } });
    await queryClient.refetchQueries(["get-workspaces"]);
    router.push(`/w/${data?.id}`);
  });
  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="flex w-full max-w-sm flex-col rounded-lg   px-4 py-6"
    >
      <Label className="text-sm font-medium leading-tight tracking-tight">
        Workspace name
      </Label>
      <Input className="mt-2 focus-visible:ring-0" {...register("name")} />
      <Button
        type="submit"
        variant={"outline"}
        className="mt-2 flex items-center justify-center gap-x-2"
      >
        {isSubmitting && <Loader className="size-4 animate-spin" />} Create
        Workspace
      </Button>
    </motion.form>
  );
};

export default CreateWorkspace;
