"use client";

import Landing from "@/components/home/landing";
import { ReactLenis } from "@studio-freight/react-lenis";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    axis: "y",
  });
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log({ latest });
  });
  const lenisRef = useRef(null);

  return (
    <div
      ref={ref}
      className="w-full flex flex-col items-center justify-center h-full"
    >
      <ReactLenis
        ref={lenisRef}
        root
        options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}
      >
        <div className="w-full h-full pb-20 flex flex-col items-center justify-center">
          <Landing scrollYProgress={scrollYProgress} />
        </div>
      </ReactLenis>
    </div>
  );
}
