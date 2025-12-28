"use client";
import React, { ReactNode } from "react";
import MainSidebar from "./MainSidebar";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="overflow-hidden h-screen w-full flex">
      <SidebarProvider>
        <MainSidebar />
        <div className="flex w-full h-screen flex-col items-center justify-center ">
          <ScrollArea className="w-full h-full overflow-y-auto ">
            <SidebarTrigger />
            <div className="w-full mx-auto max-w-5xl pb-10 mt-10">
              {children}
            </div>
          </ScrollArea>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
