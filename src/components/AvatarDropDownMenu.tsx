"use client";
import { useWorkspaces } from "@/lib/hooks/use-workspaces";
import { Layout, LogOut, Moon, Network, Sun, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";

const AvatarDropDownMenu = memo(function AvatarDropDownMenu() {
  const router = useRouter();
  const { data: user, status } = useSession();
  const { currentWorkspace } = useWorkspaces();
  const { theme, setTheme } = useTheme();

  const items = [
    {
      icon: <Layout className="mr-2 h-4 w-4" />,
      text: "Home",
      handleClick: () => {
        router.push("/");
      },
      separator: false,
    },
    {
      icon: <User className="mr-2 h-4 w-4" />,
      text: "Account",
      handleClick: () => {
        router.push(`/w/${currentWorkspace?.id}/account`);
      },
      separator: false,
    },
    {
      icon: <Network className="mr-2 h-4 w-4" />,
      text: "Workspaces",
      handleClick: () => {
        router.push("/workspace");
      },
      separator: false,
    },
    {
      icon:
        theme === "light" ? (
          <Sun className="mr-2 h-4 w-4" />
        ) : (
          <Moon className="mr-2 h-4 w-4" />
        ),
      text: "Switch Theme",
      handleClick: () => {
        setTheme(theme === "dark" ? "light" : "dark");
      },
      separator: false,
    },
    {
      icon: <LogOut className="mr-2 h-4 w-4" />,
      text: "Logout",
      handleClick: () => {
        signOut({ redirect: true, callbackUrl: "/login" });
      },
      separator: false,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={user?.user?.image as string}
          isLoading={status === "loading"}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" translate-y-2 p-0 rounded-xl border  border-neutral-200/60 dark:border-neutral-600 bg-white/70 shadow-black/10 dark:shadow-black/30 drop-shadow-xl backdrop-blur-lg dark:bg-neutral-900 w-full max-w-sm -translate-x-3">
        <div className="w-full flex px-3 py-4 flex-col items-start justify-center">
          <span className="text-sm font-medium">{user?.user?.name}</span>
          <span className="text-sm line-clamp-1 opacity-75 w-full">
            {user?.user?.email}
          </span>
        </div>
        {items.map((item, index) => {
          return (
            <DropdownMenuItem
              key={index}
              onClick={item.handleClick}
              className="w-full border-t [&>svg]:size-5 hover:bg-white hover:dark:bg-lightGray/10  [&>svg]:opacity-75  dark:border-neutral-600 px-3 py-2 border-neutral-200/60  flex items-center justify-start gap-0"
            >
              {item.icon}
              <span className="tracking-tight ml-1 ">{item.text}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default AvatarDropDownMenu;
