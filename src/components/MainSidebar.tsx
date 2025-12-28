import React from "react";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Bell, FileText, Folder, Search, Settings, Star } from "lucide-react";

const MainSidebar = () => {
  const links = [
    { icon: Search, name: "Search" },
    { icon: FileText, name: "All Docs" },
    { icon: Folder, name: "Collections" },
    { icon: Star, name: "Favorites" },
    { icon: Bell, name: "Notifications" },
    { icon: Settings, name: "Settings" },
  ];
  return (
    <Sidebar className="dark:bg-dark">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {links.map((link, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuButton asChild>
                <a href={"/"}>
                  <link.icon className="size-6" />
                  <span className="text-base">{link.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default MainSidebar;
