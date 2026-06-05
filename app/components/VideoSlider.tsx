import { useEffect, useRef, useState } from "react";
import { Link } from "@remix-run/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Slide {
  mp4Src: string | null;
  webmSrc: string | null;
  fallbackImageSrc: string | null;
  title: string;
  tag: string;
  linkTo: string;
}

interface VideoSlideProps {
  slide: Slide;
  isVisible: boolean;
  isMobile: boolean;
  /** Mobile: this slide is the active (centered) one → autoplay */
  shouldPlay?: boolean;
  /** Mobile: this slide is next in queue → preload silently while showing image */
  shouldPreload?: boolean;
}

function VideoSlide({
  slide,
  isVisible,
  isMobile,
  shouldPlay = false,
  shouldPreload = false,
}: VideoSlideProps) {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS once (useEffect avoids SSR hydration mismatch)
  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, [isMobile]);

  // Desktop: load video when slide enters viewport
  useEffect(() => {
    if (isVisible && videoRef.current && !isMobile) {
      videoRef.current.load();
    }
  }, [isVisible, isMobile]);

  // Mobile: play active video; cleanup pauses on deactivation / unmount
  useEffect(() => {
    if (!isMobile) return;
    const vid = videoRef.current;
    if (!vid) return;
    if (shouldPlay) {
      vid.play().catch(() => {});
    }
    return () => {
      vid.pause();
      vid.currentTime = 0;
    };
  }, [isMobile, shouldPlay]);

  // Mobile: reset loaded flag when slide is no longer active so the
  // fallback image shows correctly if the user scrolls back to it
  useEffect(() => {
    if (isMobile && !shouldPlay) setIsVideoLoaded(false);
  }, [isMobile, shouldPlay]);

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  const handleMouseLeave = () => {
    if (!isMobile && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // iOS prefers mp4 first; all others prefer webm
  const videoSources = isIOS ? (
    <>
      <source src={slide.mp4Src || ""} type="video/mp4" />
      <source src={slide.webmSrc || ""} type="video/webm" />
    </>
  ) : (
    <>
      <source src={slide.webmSrc || ""} type="video/webm" />
      <source src={slide.mp4Src || ""} type="video/mp4" />
    </>
  );

  return (
    <Link
      to={slide.linkTo}
      className="video-slide pl-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-container">
        {isMobile ? (
          // ── Mobile: active plays, next preloads hidden, others show image ──
          <>
            {/* Fallback image — hidden only once the active video has loaded */}
            <img
              src={slide.fallbackImageSrc || ""}
              alt={slide.title}
              className={`fallback-image${shouldPlay && isVideoLoaded ? " hidden" : ""}`}
            />

            {/* Active video — mounts when this slide is centered */}
            {shouldPlay && !hasVideoError && (
              <video
                ref={videoRef}
                className={`video-element${isVideoLoaded ? "" : " hidden"}`}
                loop
                muted
                playsInline
                preload="auto"
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => setHasVideoError(true)}
              >
                {videoSources}
              </video>
            )}

            {/* Hidden preload video for the next slide.
                preload="auto" tells the browser to buffer it now so the
                transition to the next slide is instant. Unmounts when no
                longer needed, freeing memory. */}
            {shouldPreload && !hasVideoError && (
              <video
                className="hidden"
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
              >
                {videoSources}
              </video>
            )}
          </>
        ) : (
          // ── Desktop: hover to play ──
          <>
            {(!isVisible || hasVideoError) ? (
              <img
                src={slide.fallbackImageSrc || ""}
                alt={slide.title}
                className="fallback-image"
              />
            ) : (
              <>
                {!isVideoLoaded && (
                  <img
                    src={slide.fallbackImageSrc || ""}
                    alt={slide.title}
                    className="fallback-image"
                  />
                )}
                {isVisible && !hasVideoError && (
                  <video
                    ref={videoRef}
                    className={`video-element ${isVideoLoaded ? "" : "hidden"}`}
                    loop
                    muted
                    playsInline
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onError={() => setHasVideoError(true)}
                  >
                    {videoSources}
                  </video>
                )}
              </>
            )}
          </>
        )}

        <div className="overlay"></div>
        <div className="video-info flex justify-between items-center w-full">
          <h3 className="color-bg">{slide.title}</h3>
          <div className="tag">
            <p className="color-bg">{slide.tag}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface VideoSliderProps {
  slides: Slide[];
}

export default function VideoSlider({ slides }: VideoSliderProps) {
  const wrapperRef      = useRef<HTMLDivElement>(null);
  const containerRef    = useRef<HTMLDivElement>(null);
  // Ref (not state) so it never triggers re-renders; set once on mount
  const skipAutoplayRef = useRef(false);

  const [isMobile, setIsMobile]           = useState(false);
  const [visibleSlides, setVisibleSlides] = useState<number[]>([]);
  const [progress, setProgress]           = useState(0);
  const [currentSlide, setCurrentSlide]   = useState(1);
  /** Mobile: 0-based index of the slide currently centered in the viewport */
  const [activeIndex, setActiveIndex]     = useState(0);

  // Check prefers-reduced-motion and Data Saver once on mount.
  // If either is set, skip mobile autoplay entirely (show images only).
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    skipAutoplayRef.current = prefersReduced || saveData;
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const wrapper   = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    const slidesPerView       = isMobile ? 1 : 3;
    const totalSlides         = slides.length;
    const totalSlidesToScroll = totalSlides - slidesPerView + 1;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setVisibleSlides((prev) => [...new Set([...prev, idx])]);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );

    container.querySelectorAll(".slide-item").forEach((slide) => observer.observe(slide));

    const animation = gsap.to(container, {
      x: () => -(container.scrollWidth - wrapper.offsetWidth),
      ease: "none",
      scrollTrigger: {
        trigger: wrapper,
        start: "bottom bottom",
        end: () => `+=${(totalSlidesToScroll - 1) * wrapper.offsetWidth}`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress * 100;
          setProgress(p);

          // Progress bar / counter (desktop + mobile)
          const idx = Math.min(
            Math.floor(self.progress * totalSlidesToScroll) + 1,
            totalSlides
          );
          setCurrentSlide(idx);

          // Mobile: which slide is centered?
          // Math.round flips at the midpoint → "~50% in frame" threshold
          if (isMobile) {
            setActiveIndex(
              Math.round(self.progress * Math.max(totalSlides - 1, 0))
            );
          }
        },
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      observer.disconnect();
    };
  }, [slides.length, isMobile]);

  return (
    <div className="video-slider-wrapper" ref={wrapperRef}>
      <div className="px-d">
        <h5>Selected Works</h5>
      </div>
      <div className="progress-container px-d">
        <div className="progress-bar mr-16">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="slide-count mr-d">{currentSlide}/{slides.length}</div>
      </div>
      <div className="video-slider-container" ref={containerRef}>
        {slides.map((slide, index) => (
          <div key={index} className="slide-item" data-index={index}>
            <VideoSlide
              slide={slide}
              isVisible={visibleSlides.includes(index)}
              isMobile={isMobile}
              // Mobile autoplay: active slide plays; next slide preloads silently
              shouldPlay={
                isMobile && !skipAutoplayRef.current && index === activeIndex
              }
              shouldPreload={
                isMobile && !skipAutoplayRef.current && index === activeIndex + 1
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
