"use client";
import { motion } from "framer-motion";
import React from "react";
import GradientBottom from "./editor/GradientBottom";
import { ScrollArea } from "./ui/scroll-area";

const TransitionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="flex h-screen w-full"
      initial={{ opacity: 0.3, y: "600px" }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 1.75,
        type: "tween",
        ease: "easeInOut",
      }}
    >
      <ScrollArea className="relative h-full w-full overflow-y-auto px-4 ">
        <div className=" flex w-full items-center justify-center h-full pt-[20vh]">
          <div className="flex w-full flex-col items-center justify-center h-full px-3  md:max-w-2xl md:p-0 lg:max-w-3xl xl:max-w-4xl">
            {children}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default TransitionLayout;
