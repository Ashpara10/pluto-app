import { motion } from "framer-motion";
import { FC, ReactNode } from "react";

type SlideOptionProps = {
  icon: ReactNode;
  kbd: ReactNode;
  name: string;
  onClick: () => void;
};

type MenuSlideProps = {
  options: SlideOptionProps[];
};

export const RenderOptionList: FC<MenuSlideProps> = ({ options }) => {
  return options.map((option, index) => {
    return (
      <motion.li
        key={index}
        onClick={option.onClick}
        className="flex cursor-pointer items-center justify-between border-t border-neutral-300 px-4 py-1.5 first:border-none dark:border-[#424242]"
      >
        <div className="flex items-center justify-start">
          {option?.icon}
          <span className="ml-2 tracking-tight">{option?.name}</span>{" "}
        </div>
        {option?.kbd}
      </motion.li>
    );
  });
};

export const DefaultMenuSlide: FC<MenuSlideProps> = ({ options }) => {
  return (
    <>
      {options.map((option, index) => {
        return (
          <motion.li
            key={index}
            onClick={option.onClick}
            className="flex cursor-pointer items-center justify-between border-t border-neutral-300 px-4 py-1.5 first:border-none dark:border-[#424242]"
          >
            <div className="flex items-center justify-start">
              {option?.icon}
              <span className="ml-2 tracking-tight">{option?.name}</span>{" "}
            </div>
            {option?.kbd}
          </motion.li>
        );
      })}
    </>
  );
};

export const DocumentMenuSlide: FC<MenuSlideProps> = ({ options }) => {
  return (
    <>
      {options.map((option, index) => {
        return (
          <motion.li
            key={index}
            onClick={option.onClick}
            className="flex cursor-pointer items-center justify-between border-t border-neutral-300 px-4 py-1.5 first:border-none dark:border-[#424242]"
          >
            <div className="flex items-center justify-start">
              {option?.icon}
              <span className="ml-2 tracking-tight">{option?.name}</span>{" "}
            </div>
            {option?.kbd}
          </motion.li>
        );
      })}
    </>
  );
};
