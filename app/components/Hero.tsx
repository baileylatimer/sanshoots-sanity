import { useRef, useEffect, useState } from "react";

// ReelBlock — the film-strip SVG rectangles
function ReelBlock() {
  return (
    <svg className="reel-block" width="40" height="70" viewBox="0 0 40 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.731201" width="39.1366" height="69.4875" rx="10.3832" fill="var(--color-contrast-higher)"/>
    </svg>
  );
}

// VideoSVGMask — the eye-shaped video mask for the "OO" in SANSHOOTS
interface VideoSVGMaskProps {
  webmSrc: string;
  mp4Src: string;
  fallbackImageSrc: string;
}

function VideoSVGMask({ webmSrc, mp4Src, fallbackImageSrc }: VideoSVGMaskProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    setIsIOS(iOS);

    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;

      // Catch the race condition where the video already loaded before React
      // attached the onLoadedData listener (common in Remix SSR hydration)
      if (videoRef.current.readyState >= 2) {
        setIsVideoLoaded(true);
      }
    }

    const playVideoOnTouch = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };
    document.addEventListener("touchstart", playVideoOnTouch);
    return () => document.removeEventListener("touchstart", playVideoOnTouch);
  }, []);

  return (
    <div className="video-svg-wrapper">
      <svg className="svg-class" viewBox="0 0 193 473" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="clip-shape" clipPathUnits="objectBoundingBox">
            <path d="M0 0.8689C0 0.9571 0.1887 1 0.5 1C0.8113 1 1 0.9571 1 0.8689V0.1311C1 0.0429 0.8113 0 0.5 0C0.1887 0 0 0.0429 0 0.1311V0.8689Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="video-container-2">
        <img
          src={fallbackImageSrc}
          alt="Video fallback"
          className={`fallback-image ${isVideoLoaded && !hasVideoError ? "hidden" : ""}`}
        />
        <video
          ref={videoRef}
          className={`video-class-2 ${isVideoLoaded && !hasVideoError ? "" : "hidden"}`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={() => setHasVideoError(true)}
        >
          {isIOS ? (
            <>
              <source src={mp4Src} type="video/mp4" />
              <source src={webmSrc} type="video/webm" />
            </>
          ) : (
            <>
              <source src={webmSrc} type="video/webm" />
              <source src={mp4Src} type="video/mp4" />
            </>
          )}
        </video>
      </div>
    </div>
  );
}

// The eye videos are static brand assets — they live in /public/videos/
const EYE_LEFT_WEBM = "/videos/eye-left-5.webm";
const EYE_LEFT_MP4 = "/videos/eye-left-5.mp4";
const EYE_LEFT_FALLBACK = "/images/eye-left-fallback.jpg";
const EYE_RIGHT_WEBM = "/videos/eye-right-6.webm";
const EYE_RIGHT_MP4 = "/videos/eye-right-6.mp4";
const EYE_RIGHT_FALLBACK = "/images/eye-right-fallback.jpg";

export default function Hero() {
  const DESKTOP_REELS = 12;
  const MOBILE_REELS = 8;

  return (
    <div className="hero mb-0 lg:mb-16">
      {/* Desktop top reel strip */}
      <div className="desktop bars">
        <div className="flex justify-between hero-reel px-d lg:mt-36">
          {Array.from({ length: DESKTOP_REELS }).map((_, i) => <ReelBlock key={i} />)}
        </div>
      </div>
      {/* Mobile top reel strip */}
      <div className="mobile px-d">
        <div className="flex justify-between hero-reel mt-24">
          {Array.from({ length: MOBILE_REELS }).map((_, i) => <ReelBlock key={i} />)}
        </div>
      </div>

      {/* SANSHOOTS hero text with eye video masks */}
      <div className="hero-text-container px-d">
        <span data-text="SANSH" className="hero-text">SANSH</span>
        <VideoSVGMask
          webmSrc={EYE_LEFT_WEBM}
          mp4Src={EYE_LEFT_MP4}
          fallbackImageSrc={EYE_LEFT_FALLBACK}
        />
        <VideoSVGMask
          webmSrc={EYE_RIGHT_WEBM}
          mp4Src={EYE_RIGHT_MP4}
          fallbackImageSrc={EYE_RIGHT_FALLBACK}
        />
        <span data-text="TS" className="hero-text">TS</span>
      </div>

      {/* Desktop bottom reel strip */}
      <div className="desktop bars bars-2">
        <div className="flex justify-between hero-reel px-d hero-reel-2">
          {Array.from({ length: DESKTOP_REELS }).map((_, i) => <ReelBlock key={i} />)}
        </div>
      </div>
      {/* Mobile bottom reel strip */}
      <div className="mobile px-d bars-2">
        <div className="flex justify-between hero-reel bars bars-2">
          {Array.from({ length: MOBILE_REELS }).map((_, i) => <ReelBlock key={i} />)}
        </div>
      </div>
    </div>
  );
}
