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
}

function VideoSlide({ slide, isVisible, isMobile }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
    }
  }, [isMobile]);

  useEffect(() => {
    if (isVisible && videoRef.current && !isMobile) {
      videoRef.current.load();
    }
  }, [isVisible, isMobile]);

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

  return (
    <Link
      to={slide.linkTo}
      className="video-slide pl-4"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-container">
        {(isMobile || !isVisible || hasVideoError) ? (
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
            {!isMobile && isVisible && !hasVideoError && (
              <video
                ref={videoRef}
                className={`video-element ${isVideoLoaded ? "" : "hidden"}`}
                loop
                muted
                playsInline
                onLoadedData={() => setIsVideoLoaded(true)}
                onError={() => setHasVideoError(true)}
              >
                {isIOS ? (
                  <>
                    <source src={slide.mp4Src || ""} type="video/mp4" />
                    <source src={slide.webmSrc || ""} type="video/webm" />
                  </>
                ) : (
                  <>
                    <source src={slide.webmSrc || ""} type="video/webm" />
                    <source src={slide.mp4Src || ""} type="video/mp4" />
                  </>
                )}
              </video>
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    const slidesPerView = isMobile ? 1 : 3;
    const totalSlides = slides.length;
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
        anticipatePin: 1,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress * 100;
          setProgress(p);
          const idx = Math.min(Math.floor(self.progress * totalSlidesToScroll) + 1, totalSlides);
          setCurrentSlide(idx);
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
            />
          </div>
        ))}
      </div>
    </div>
  );
}
