"use client";
import { delay } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { EyeIcon, EyeOffIcon, Loader } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { Button } from "../ui/button";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const Login = () => {
  const { handleSubmit, register } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [show, setShow] = React.useState(false);

  const handleLogin = handleSubmit(async (values) => {
    setIsLoading(true);
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/workspace",
      email: values.email,
      password: values.password,
    });
    if (!res?.ok && res?.error) {
      setIsLoading(false);
      toast.error(res?.error);
      return;
    }
    setIsLoading(false);
    toast.success("LoggedIn successfully");
  });
  const handleOauthLogin = async (provider: string) => {
    const res = await signIn(provider, {
      redirect: true,
      callbackUrl: "/workspace",
    });
    if (!res?.ok && res?.error) {
      toast.error(res?.error);
      return;
    }
    toast.success("LoggedIn successfully");
  };

  return (
    <div className="flex w-full z-20 max-w-md flex-col px-6 py-10 ">
      <div className="mb-4">
        <span className="text-xl font-medium tracking-tight">Welcome Back</span>
      </div>
      <div className="flex w-full flex-col space-y-2">
        <Button
          className="w-full border-neutral-300 bg-white"
          variant={"outline"}
          onClick={async () => handleOauthLogin("github")}
        >
          <Image
            src={"/github.svg"}
            className="mr-2 p-1.5"
            width={38}
            height={38}
            alt=""
          />{" "}
          <span className="opacity-80 hover:opacity-100">
            Login with Github
          </span>
        </Button>
        <Button
          variant={"outline"}
          className="w-full border-neutral-300 bg-white"
          onClick={async () => handleOauthLogin("google")}
        >
          <Image
            src={"/google.svg"}
            className="mr-2 p-1.5"
            width={38}
            height={38}
            alt=""
          />
          <span className="opacity-80 hover:opacity-100">
            Login with Google
          </span>
        </Button>
      </div>
      <div className="my-4 flex w-full items-center justify-center gap-x-2">
        <Separator className="h-[0.9px] w-full bg-neutral-300/60 dark:bg-lightGray/10" />{" "}
        <span className="text-sm opacity-80">or</span>
        <Separator className="h-[0.9px] w-full bg-neutral-300/60 dark:bg-lightGray/10" />
      </div>

      <form onSubmit={handleLogin} className="flex w-full  flex-col space-y-2">
        <input
          className="rounded-lg border  border-neutral-300 px-4 py-2  dark:border-neutral-600"
          {...register("email")}
          placeholder="Email"
        />
        <div className="mt-2 flex items-center justify-center overflow-hidden rounded-lg border border-neutral-300  dark:border-neutral-600">
          <input
            className="w-full px-4 py-2"
            {...register("password")}
            placeholder="Password"
            type={show ? "text" : "password"}
          />
          <div className="bg-transparent p-2" onClick={() => setShow(!show)}>
            {show ? (
              <EyeOffIcon
                strokeWidth={1.6}
                className=" h-6 w-6 cursor-pointer opacity-80"
              />
            ) : (
              <EyeIcon
                strokeWidth={1.6}
                className=" h-6 w-6 cursor-pointer opacity-80"
              />
            )}
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 flex items-center justify-center rounded-lg bg-[#6a5ed9] px-4 py-2  text-white  hover:bg-[#564ac6]"
        >
          {isLoading && (
            <Loader className="size-4 animate-spin opacity-80 mr-2" />
          )}
          <span className="font-medium ">Login</span>
        </button>
      </form>
      <div className="w-full flex items-center justify-center  mt-3">
        <span className="text-sm ">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-[#6a5ed9] cursor-pointer"
          >
            Sign up
          </span>
        </span>
      </div>
    </div>
  );
};

export default Login;
