"use client";
import { useCreateDocumentDialog } from "@/lib/context";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import toast from "react-hot-toast";
// import { useSession } from "next-auth/react";

const CreateDocumentDialogSchema = z.object({
  url: z.string().optional().nullable(),
  title: z.string(),
});

const CreateDocumentDialog = () => {
  const { createDocumentDialogOpen, setCreateDocumentDialogOpen } =
    useCreateDocumentDialog();
  const { register, handleSubmit } = useForm<
    z.infer<typeof CreateDocumentDialogSchema>
  >({
    defaultValues: {
      title: "",
      url: "",
    },
    resolver: zodResolver(CreateDocumentDialogSchema),
  });
  // const { data } = useSession();
  return (
    <Dialog
      open={createDocumentDialogOpen}
      onOpenChange={setCreateDocumentDialogOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
        </DialogHeader>
        <div>
          <form
            onSubmit={handleSubmit(async (values) => {
              try {
                const resp = await fetch("/api/document", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    ...values,
                    // user: data?.user?.email,
                  }),
                });
                const res = await resp.json();
                // console.log(resp, res);
              } catch (error) {
                if (error instanceof AxiosError) {
                  console.log(error);
                  toast.error(error.response?.data.message);
                }
              }
            })}
          >
            <input {...register("title")} />
            <input {...register("url")} />
            <button>Create Document</button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDocumentDialog;
