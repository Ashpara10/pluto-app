"use client";
import { motion, Variants } from "framer-motion";
import { ChevronRight, Moon, Sun } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AnimatedTitle from "../AnimatedTitle";

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

const Landing = () => {
  const { status, data } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const toggleTheme = [
    {
      id: "light",
      name: "Light-Theme-Button",
      icon: (
        <Sun className="size-4 dark:stroke-white stroke-black  opacity-80" />
      ),
    },
    {
      id: "dark",
      name: "Dark-Theme-Button",
      icon: (
        <Moon className="size-4 dark:stroke-white stroke-black  opacity-80" />
      ),
    },
  ];

  return (
    <section
      id="hero"
      className="w-full h-full relative  flex flex-col items-center justify-center"
    >
      <motion.div
        variants={gradientVariants}
        initial="initial"
        animate="animate"
        className="absolute  w-full h-screen bottom-0 -z-10  items-center  bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-300"
      />
      <div className="w-full md:max-w-5xl xl:max-w-7xl mt-14 md:mb-10 min-h-screen flex flex-col items-center justify-center ">
        <div className=" w-full md:max-w-5xl flex flex-col items-center justify-center px-4 md:px-0">
          <motion.div
            initial={{
              y: 100,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              ease: [0.2, 0.65, 0.3, 0.9],
              type: "spring",
            }}
            className="mb-8 md:mb-10 lg:mb-12 xl:mb-16"
          >
            <Image
              src={"/landing/logo.svg"}
              width={50}
              height={50}
              className="aspect-square size-10 md:size-12 lg:size-16  rounded-xl"
              priority
              alt="Pluto logo"
            />
          </motion.div>
          <h2 className="w-full flex flex-col items-center  justify-center text-2xl lg:text-4xl md:leading-snug xl:text-6xl tracking-tight relative leading-tight font-medium md:font-medium">
            <AnimatedTitle text={"Create & Write Content"} />
            <AnimatedTitle text={"with AI-Powered Intelligent Tools"} />
          </h2>
          <AnimatedTitle
            className="w-full text-sm sm:text-base md:text-lg text-center flex  items-center justify-center leading-tight text-neutral-800 dark:text-neutral-100/80 mt-4 whitespace-pre-wrap max-w-sm md:max-w-xl"
            text={
              "Effortless document management meets AI-powered chat—Pluto revolutionizes the way you create, organize, and collaborate."
            }
          />

          <motion.div
            variants={imageVariants}
            initial="initial"
            animate="animate"
            className="mt-4 space-x-3"
          >
            <button
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
              className="pl-8 pr-6 font-medium tracking-normal dark:text-black text-white hover:text-white/80 bg-black dark:bg-white  flex items-center justify-center py-2 text-sm md:text-base transition-all rounded-xl  "
            >
              {status === "authenticated"
                ? "Dashboard"
                : "Get Started for free"}
              <ChevronRight className="ml-2 size-4 opacity-80" />
            </button>
          </motion.div>
        </div>
        <motion.div
          variants={imageVariants}
          initial="initial"
          animate="animate"
          style={{ filter: "drop-shadow(4px 34px 24px #000000bb)" }}
          className=" w-full relative md:max-w-5xl mt-8 p-3 flex flex-col items-center justify-center "
        >
          {theme === "dark" ? (
            <Image
              src={"/landing/light-mode-chat.png"}
              width={1400}
              quality={100}
              height={1250}
              priority
              className="w-full h-full flex rounded-xl "
              alt="Pluto app interface showing a document editor with a clean, minimal design"
            />
          ) : (
            <Image
              src={"/landing/dark-mode-chat.png"}
              width={1400}
              quality={100}
              height={1250}
              priority
              className="w-full h-full flex rounded-xl "
              alt="Pluto app interface showing a document editor with a clean, minimal design"
            />
          )}
          {/* <Image
            src={"/landing/mobile-2.png"}
            width={1200}
            quality={100}
            height={1000}
            className="scale-90 rounded-xl md:hidden"
            alt="Pluto app interface showing a document editor with a clean, minimal design"
          /> */}
        </motion.div>
        <div className="max-w-5xl w-full flex items-center justify-center mt-8 px-3">
          <motion.div
            layout
            className="w-fit overflow-hidden px-1 py-1 scale-90 md:scale-100 flex gap-2 items-center bg-neutral-200 dark:bg-neutral-800 justify-center relative rounded-xl"
          >
            {toggleTheme.map((t) => {
              return (
                <>
                  <button
                    key={t?.id}
                    onClick={() => setTheme(t?.id)}
                    className="relative p-2 aspect-square  flex items-center justify-center"
                  >
                    {t?.icon}
                    {theme === t?.id && (
                      <motion.div
                        layoutId="theme-toggle"
                        className="absolute inset-0 z-10 rounded-lg mix-blend-difference bg-black"
                      />
                    )}
                  </button>
                </>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
