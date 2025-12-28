"use client";
import React, { FC } from "react";
import { Input } from "../ui/input";
import { useSession } from "next-auth/react";
import { Label } from "../ui/label";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { Button } from "../ui/button";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import Link from "next/link";
import { Workspace } from "@/lib/db/schema";

const UpdateAccount = () => {
  const { data: user, status } = useSession();
  const { currentWorkspace, workspaces } = useWorkspaces();
  const methods = useForm({
    values: {
      image: user?.user?.image,
      name: user?.user?.name,
      email: user?.user?.email,
      defaultWorkspace: currentWorkspace?.name,
    },
  });
  return (
    <div className="max-w-xl w-full">
      <FormProvider {...methods}>
        <div className="mt-10">
          <UpdateProfileForm />
          <UpdateWorkspaceSettings
            workspaces={workspaces!}
            curentWorkspace={currentWorkspace!}
          />
        </div>
      </FormProvider>
    </div>
  );
};

const UpdateWorkspaceSettings: FC<{
  workspaces: Workspace[];
  curentWorkspace: Workspace;
}> = ({ workspaces, curentWorkspace }) => {
  const form = useFormContext();
  return (
    <div className="mt-6 w-full border dark:border-neutral-600 border-neutral-300/80 rounded-lg p-3 ">
      <div>
        <h3 className="text-xl font-medium tracking-tight">
          Configure Workspace Settings
        </h3>
        <span className="opacity-75 leading-snug text-sm">
          Update and Configure your worspace settings
        </span>
      </div>
      <div>
        <form {...form} className="mt-4">
          <FormField
            control={form.control}
            name="defaultWorkspace"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="dark:border-neutral-600 border-neutral-300/80 bg-neutral-100 dark:bg-neutral-800">
                    {workspaces?.map((workspace, i) => {
                      return (
                        <SelectItem key={i} value={workspace?.name}>
                          {workspace?.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </div>
    </div>
  );
};

const UpdateProfileForm: FC = () => {
  const { register, getValues } = useFormContext();
  const values = getValues();
  return (
    <div className="w-full">
      <div>
        <h3 className="text-xl font-medium tracking-tight">Your Account</h3>
        <span className="opacity-75 leading-snug">
          This information will be visible to other users on Pluto.app
        </span>
      </div>
      <div>
        <form className="py-4 flex flex-col items-start gap-3 justify-center">
          <div className="flex">
            <label htmlFor="file-input">
              {values?.image ? (
                <Image
                  className="rounded-full"
                  src={values?.image}
                  alt={`${values?.name}-avatar`}
                  width={60}
                  height={60}
                />
              ) : (
                // <div>
                <div className="size-[60px] rounded-full bg-gradient-to-tr from-red-500 via-indigo-300 to-transparent" />
              )}
            </label>

            <input id="file-input" {...register("image")} className="hidden" />
            <div className="ml-2 flex flex-col items-start justify-center">
              {/* <div>
                <span className="text-sm mb-1 font-medium tracking-tight">
                  Profile Image
                </span>
              </div> */}
              <div className="flex items-center justify-start gap-2">
                <Button type="button" size={"sm"} variant={"outline"}>
                  Upload
                </Button>
                <Button type="button" size={"sm"} variant={"outline"}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
          <Label>Name</Label>
          <Input {...register("name")} />
          <Label>Email</Label>
          <Input {...register("email")} />
          <div className="flex mt-3 gap-3 w-full items-center justify-start">
            <Button size={"sm"}>Discard Changes</Button>
            <Button size={"sm"}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAccount;
