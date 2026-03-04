"use client";
import { motion } from "framer-motion";
import React from "react";
import { ScrollArea } from "./ui/scroll-area";

const TransitionLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      className="flex h-screen max-w-3xl mx-auto w-full"
      // initial={{ opacity: 0.3, y: "600px" }}
      // animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 1.75,
        type: "tween",
        ease: "easeInOut",
      }}
    >
      <ScrollArea className="relative h-full w-full overflow-y-auto  ">
        <div className="flex w-full mx-auto mt-24 flex-col items-center justify-center  px-6">
          {children}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default TransitionLayout;
