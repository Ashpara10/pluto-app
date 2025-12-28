"use client";
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  Variants,
} from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "../ui/button";
import payload from "./data.json";
import DocumentCardItem from "../documents/DocumentCard";
import { Document } from "@/lib/db/schema";
import DocumentViewOptions from "../DocumentViewOptions";
import Image from "next/image";
const gradientVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.2,
    y: "80%",
    filter: "blur(80px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: ["blur(120px)", "blur(180px)"],
    transition: {
      duration: 1,
      ease: "easeInOut",
      type: "spring",
    },
  },
};
const imageVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.2,
    y: "80%",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.2, 0.65, 0.3, 0.9],
      type: "spring",
    },
  },
};
const positions = [
  { x: -100, y: -300, scale: 0.8, z: 1, rotate: -6 }, // latte
  { x: -100, y: -600, scale: 0.8, z: 1, rotate: 6 }, //dog
  { x: 0, y: -200, scale: 0.8, z: 1, rotate: -6 }, //drake
  { x: 180, y: -200, scale: 0.8, z: 6, rotate: -4 }, //cliff
  { x: 180, y: -200, scale: 0.8, z: 4, rotate: -6 }, //plane
];

type LandingProps = {
  scrollYProgress: MotionValue<number>;
};

const Landing = ({ scrollYProgress }: LandingProps) => {
  const { status, data } = useSession();
  const router = useRouter();

  return (
    <section
      id="hero"
      className="w-full h-full overflow-x-hidden flex flex-col items-center justify-center"
    >
      <motion.div
        variants={gradientVariants}
        initial="initial"
        animate="animate"
        className="absolute w-full h-screen bottom-0 -z-10  items-center  bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400"
      />
      <div className=" w-full md:mt-[160px] md:max-w-5xl flex flex-col items-center justify-center px-4 md:px-0">
        <h2 className="text-center dark:text-neutral-50 text-4xl font-medium tracking-tighter  ">
          Create & Write Content <br /> with{" "}
          <span className="font-thin font-instrument ">AI-Powered</span>{" "}
          Intelligent Tools
        </h2>
        <p className="text-xl tracking-tight text-center mt-6 text-neutral-200">
          Your brain’s a thinker, not a filing cabinet. Let <br /> your thoughts
          rest somewhere better.
          {/* Effortless document management meets AI-powered chat <br />
          Pluto revolutionizes the way you create, organize, and collaborate. */}
        </p>

        <Button
          className="mt-6 dark:bg-black hover:dark:bg-neutral-900 hover:dark:text-neutral-300 dark:text-neutral-50 text-lg rounded-3xl px-10 h-12"
          // variant={"outline"}
          onClick={() => {
            if (status === "authenticated" && data?.user?.activeWorkspace) {
              router.push(`/w/${data?.user?.activeWorkspace?.slug}`);
              return;
            } else if (
              status === "authenticated" &&
              !data?.user?.activeWorkspace
            ) {
              router.push("/workspace");
              return;
            }
            router.push("/login");
          }}
        >
          {status === "authenticated" ? "Dashboard" : "Get Started"}
          {/* <ChevronRight className="ml-2 size-4 opacity-80" /> */}
        </Button>
      </div>
      <div className="w-full  relative mt-24 ">
        <div className="md:max-w-5xl max-w-md h-[360px] relative rounded-2xl overflow-hidden w-full border dark:border-[#DCDADE]/10 border-neutral-200 mx-auto md:h-[600px]">
          <Image
            fill
            src={"/preview.png"}
            style={{ objectFit: "cover" }}
            alt=""
          />
        </div>
        {/* <div className="size-[400px] bg-indigo-600 rounded-full blur-[200px] absolute left-10 bottom-14" />
        <div className="size-[400px] bg-pink-600 rounded-full blur-[200px] absolute right-10 top-42" /> */}
        {/* <div className="max-w-6xl mx-auto sticky top-20 rounded-3xl flex items-center justify-center py-5 px-8 bg-neutral-900 shadow-2xl border border-neutral-800 mt-[400px] w-full ">
          <div className=" w-full">
            <DocumentViewOptions disabled={true} title="All Documents">
              <div className="columns-4 w-full  gap-4">
                {payload?.documents?.slice(0, 4)?.map((document, i) => {
                  return (
                    <FloatingDocumentCard
                      index={i}
                      key={i}
                      document={document as any}
                      scrollYProgress={scrollYProgress}
                    />
                  );
                })}
              </div>
            </DocumentViewOptions>
          </div>
        </div> */}
      </div>
      {/* <motion.div className=" w-full md:max-w-5xl aspect-square max-h-[70dvh] mt-8 px-6 flex flex-col items-center justify-center  overflow-hidden rounded-2xl relative">
        <img
          style={{ objectFit: "fill" }}
          className="absolute inset-0 z-[-1] w-full h-full "
          src="https://i.pinimg.com/1200x/89/95/61/899561a11244a5bc9939beadd03349a7.jpg"
          alt=""
        />
        <motion.div
          style={{ filter: "drop-shadow(4px 34px 24px #000000bb)" }}
          className=" w-full h-[80vh] bg-neutral-200 border border-neutral-200 px-3 rounded-t-3xl overflow-hidden "
        >
          <div className="w-full px-2 flex gap-x-1 py-2  items-center justify-start">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="size-4 bg-neutral-300 rounded-full "
              />
            ))}
          </div>
          <div className="bg-neutral-50 border border-neutral-200 w-full h-full rounded-t-2xl overflow-hidden"></div>
        </motion.div>

     
      </motion.div> */}

      {/* </div> */}
    </section>
  );
};

const FloatingDocumentCard = ({
  document,
  scrollYProgress,
  index,
}: {
  document: Document;
  scrollYProgress: MotionValue<number>;
  index: number;
}) => {
  const x = useTransform(
    scrollYProgress,
    [0.5, 0.86],
    [positions[index]?.x, 0]
  );
  const y = useTransform(scrollYProgress, [0.5, 0.86], [-400, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [positions[index]?.scale, 1, 1]
  );
  const rotate = useTransform(
    scrollYProgress,
    [0.4, 0.7, 0.86],
    [positions[index]?.rotate, positions[index]?.rotate - 2, 0]
  );

  return (
    <motion.div
      style={{
        rotate: rotate,
        y,
        // scale: scale,
      }}
      transition={{
        duration: 0.9,
        ease: [0.6, 0.05, -0.01, 0.9],
      }}
      className="mt-3  first:mt-0 break-inside-avoid"
    >
      <DocumentCardItem
        document={document as any}
        handleCheckChange={() => { }}
        checked={false}
        isFavourite={false}
      />
    </motion.div>
  );
};

export default Landing;
