import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import Header from "./Header";
import Footer from "./Footer";
import Cursor from "./Cursor";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // ignoreMobileResize: stop ScrollTrigger recomputing pins on iOS toolbar show/hide
    ScrollTrigger.config({ ignoreMobileResize: true });

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,      // tunable: higher = smoother/laggier
      effects: true,    // enables data-speed / data-lag parallax attributes
      normalizeScroll: true, // fixes iOS address-bar resize jitter on pinned sections
      // smoothTouch intentionally omitted → native scroll on touch devices
    });

    return () => {
      smoother.kill();
    };
  }, []);

  return (
    <>
      {/* Cursor + Header are OUTSIDE the smooth wrapper so position:fixed works */}
      <Cursor />
      <Header />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className={className}>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}
