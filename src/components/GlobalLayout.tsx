"use client";
import { ReactNode } from "react";
import ChatWithDocumentSidebar from "./chat/chat-with-document-sidebar";
import FloatingMenu from "./FloatingMenu";
import Navbar from "./Navbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";
import GradientBottom from "./editor/GradientBottom";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import MainSidebar from "./MainSidebar";
import RightSidebar from "./RightSidebar";

const GlobalLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="relative h-screen w-full overflow-hidden bg-white  dark:bg-neutral-900"
    >
      <SidebarProvider>
        <MainSidebar />
        <ResizablePanel className="relative w-full ">
          <div className="absolute left-0 right-0 flex w-full items-center justify-center ">
            <div className="fixed bottom-5 z-40 w-full ">
              <FloatingMenu />
            </div>
          </div>

          <ScrollArea className="w-full  relative overflow-hidden overflow-y-auto h-screen">
            <SidebarTrigger className="size-6 dark:stroke-neutral-400 bg-transparent z-40 left-4 top-4 absolute" />
            {children}
            <GradientBottom />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle className="z-20 hidden md:flex" />
        <RightSidebar />
      </SidebarProvider>
    </ResizablePanelGroup>
  );
};

export default GlobalLayout;
