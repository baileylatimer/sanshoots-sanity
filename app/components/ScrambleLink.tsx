import { useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import type { LinkProps } from "@remix-run/react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface ScrambleLinkProps extends Omit<LinkProps, "children"> {
  children: string;
  /** Number of leading characters that never scramble. Default: 3 */
  lockChars?: number;
  /** Total scramble animation duration in ms. Default: 500 */
  duration?: number;
}

export default function ScrambleLink({
  children,
  lockChars = 3,
  duration = 500,
  onMouseEnter,
  ...linkProps
}: ScrambleLinkProps) {
  const [display, setDisplay] = useState(children);
  const rafRef = useRef<number | null>(null);

  // Keep display in sync if the label prop changes
  useEffect(() => {
    setDisplay(children);
  }, [children]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const startScramble = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(e as React.MouseEvent<HTMLAnchorElement>);
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const text = children;
    const total = text.length;
    const scrambleCount = Math.max(total - lockChars, 0);
    if (scrambleCount === 0) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const settledCount = Math.floor(progress * scrambleCount);

      let out = text.slice(0, lockChars);
      for (let i = lockChars; i < total; i++) {
        const sIdx = i - lockChars;
        if (sIdx < settledCount) {
          out += text[i];
        } else {
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      setDisplay(out);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  return (
    <Link {...linkProps} onMouseEnter={startScramble}>
      {display}
    </Link>
  );
}
