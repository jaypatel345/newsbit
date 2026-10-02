"use client";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

// Shared motion language for the marketing pages: elements fade in while
// rising a short distance on a long, soft ease-out. `Reveal` plays once when
// it scrolls into view; `RevealGroup` + `RevealItem` stagger a set of
// children (cards, list rows) so they arrive one after another.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  // Play on mount instead of waiting to scroll into view (above-the-fold).
  immediate?: boolean;
};

export function Reveal({ delay = 0, y = 18, immediate = false, ...props }: RevealProps) {
  const target = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...(immediate ? { animate: target } : { whileInView: target, viewport: VIEWPORT })}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
      {...props}
    />
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

export function RevealGroup({
  stagger = 0.08,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      variants={groupVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...props}
    />
  );
}

export function RevealItem(props: HTMLMotionProps<"div">) {
  return <motion.div variants={itemVariants} {...props} />;
}

// Same as `Reveal`, but renders a <section> so content pages keep their
// document outline.
export function RevealSection({ delay = 0, y = 18, ...props }: HTMLMotionProps<"section"> & { delay?: number; y?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
      {...props}
    />
  );
}
