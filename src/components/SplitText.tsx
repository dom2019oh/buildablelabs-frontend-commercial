import { useRef, CSSProperties } from "react";
import { gsap } from "gsap";
import { SplitText as GSAPSplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(GSAPSplitText, ScrollTrigger, useGSAP);

interface SplitTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Stagger between each unit in milliseconds */
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  rootMargin?: string;
  onLetterAnimationComplete?: () => void;
  tag?: keyof JSX.IntrinsicElements;
}

export default function SplitText({
  text,
  className = "",
  style = {},
  delay = 60,
  duration = 0.65,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 36, filter: "blur(10px)" },
  to   = { opacity: 1, y: 0,  filter: "blur(0px)" },
  rootMargin = "0px",
  onLetterAnimationComplete,
  tag: Tag = "span",
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      const split = new GSAPSplitText(el, {
        type: splitType,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
      });

      const targets =
        splitType === "chars"
          ? split.chars
          : splitType === "words"
          ? split.words
          : split.lines;

      gsap.fromTo(targets, from, {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: el,
          start: `top bottom-=${rootMargin}`,
          toggleActions: "play none none none",
        },
        onComplete: () => {
          split.revert();
          onLetterAnimationComplete?.();
        },
      });
    },
    { scope: containerRef }
  );

  const El = Tag as "span";
  return (
    <El
      // @ts-ignore — ref type widened below
      ref={containerRef as React.RefObject<HTMLSpanElement>}
      className={className}
      style={{ display: "block", ...style }}
    >
      {text}
    </El>
  );
}
