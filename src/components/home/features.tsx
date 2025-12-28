import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { FC, useEffect } from "react";
import { useInView } from "react-intersection-observer";

const Features = () => {
  const [ref, inView, entry] = useInView({ threshold: 1 });
  const controls = useAnimation();
  const features = [
    {
      image: "/landing/features/ai2.png",
      title: "AI-Powered Assistance",
      description:
        "Get suggestions and recommendations based on your usage patterns and preferences.",
    },
    {
      image: "/landing/features/summary.png",

      title: "Summarize & Analyze Content",
      description:
        "Get the gist of any webpage with just one click using our Chrome extension. We’re with you wherever you go.",
    },
    {
      image: "/landing/features/image.png",
      title: "Fetch Articles & Update",
      description:
        "Fetch articles,journals,blogs from the web and update them in your document with a single click.",
    },
    {
      image: "/landing/features/md4.png",
      title: "Export your Content",
      description:
        "Export your documents into markdown format and share them with your team or clients.",
    },
  ];
  useEffect(() => {
    if (inView) {
      controls.start("visible");
      return;
    }
    controls.start("hidden");
  }, [inView, controls]);
  const boxVariant = {
    hidden: {
      x: "-100vw", //move out of the site
    },
    visible: {
      x: 0, // bring it back to nrmal
      transition: {
        delay: 0.5,
        when: "beforeChildren", //use this instead of delay
        staggerChildren: 0.25, //apply stagger on the parent tag
      },
    },
  };
  const listVariant = {
    hidden: {
      y: 10, //move out of the site
      opacity: 0,
    },
    visible: {
      y: 0, // bring it back to nrmal
      opacity: 1,
    },
  };

  return (
    <section
      id="features"
      className="w-full h-full relative  flex flex-col items-center justify-center"
    >
      <div className="w-full md:max-w-5xl px-4 mt-14 md:mb-10 min-h-screen flex flex-col items-center justify-center ">
        <motion.h3
          variants={listVariant}
          initial={"hidden"}
          animate={"visible"}
          className="text-2xl lg:text-3xl xl:text-4xl md:font-medium lg:font-semibold tracking-tight"
        >
          What’s Under Pluto’s Hood?
        </motion.h3>
        <motion.div
          variants={boxVariant}
          animate="visible"
          initial="hidden"
          className="grid mt-10 md:mt-16 grid-cols-1 gap-y-8 md:grid-cols-2 md:gap-y-4 md:gap-x-6 w-full"
        >
          {features.map((f, i) => {
            return (
              <motion.div ref={ref} key={i} variants={listVariant}>
                <FeatureCard feature={f} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

type FeatureCardProps = {
  feature: { title: string; description: string; image: string | null };
};

const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  return (
    <div className="w-full mt-4 md:mt-3">
      <div className="w-full group overflow-hidden relative  rounded-2xl  mb-3 border  border-neutral-200 dark:border-neutral-600 ">
        {feature?.image && (
          <Image
            src={feature.image}
            width={500}
            height={380}
            alt="feature"
            className="w-full aspect-video group-hover:scale-105 transition-all duration-150 ease-linear h-full object-cover rounded-2xl"
          />
        )}
      </div>
      <div className="flex flex-col">
        <h4 className="text-xl font-medium tracking-tight leading-snug">
          {feature.title}
        </h4>
        <p className="leading-snug mt-1 opacity-80 font-medium">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default Features;
