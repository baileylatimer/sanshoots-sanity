import { useEffect, useRef } from "react";
import { Link } from "@remix-run/react";

interface PageBuilderBlock {
  _type: string;
  _key: string;
  headingLines?: string[];
  image?: { asset?: { url: string } };
  alt?: string;
  heading?: string;
  text?: string;
  images?: Array<{ asset?: { url: string }; _key: string }>;
  reelUrl?: string;
  useExtraSmall?: boolean;
}

interface ProjectPageProps {
  vimeoUrl: string;
  projectTitle: string;
  projectTag: string;
  projectInfo: string[];
  pageBuilder: PageBuilderBlock[];
  nextProjectTitle: string;
  nextProjectUrl: string;
}

function renderBlock(block: PageBuilderBlock, index: number) {
  const isSmallWidth = block._type === "imageBlock" || block._type === "paragraphBlock";
  const isExtraSmall = block._type === "reelBlock" && block.useExtraSmall !== false;

  let detailClass = "project-detail";
  if (isExtraSmall) detailClass += " project-detail--xs";
  else if (isSmallWidth) detailClass += " project-detail--sm";

  switch (block._type) {
    case "titleBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="content-width">
            <h3 className="text-center">
              {(block.headingLines || []).map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h3>
          </div>
        </div>
      );

    case "imageBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-image">
            <img src={block.image?.asset?.url || ""} alt={block.alt || ""} />
          </div>
        </div>
      );

    case "galleryBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-gallery flex flex-col md:flex-row gap-4 h-full">
            <div className="w-full md:w-1/2 h-1/2 md:h-full">
              <img src={block.images?.[0]?.asset?.url || ""} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4 h-1/2 md:h-full">
              <div className="h-1/2">
                <img src={block.images?.[1]?.asset?.url || ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="h-1/2 flex gap-4">
                <div className="w-1/2 h-full">
                  <img src={block.images?.[2]?.asset?.url || ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-1/2 h-full">
                  <img src={block.images?.[3]?.asset?.url || ""} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "paragraphBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-paragraph flex flex-col content-width">
            <h3 className="whitespace-normal">{block.heading}</h3>
            <p className="whitespace-normal">{block.text}</p>
          </div>
        </div>
      );

    case "reelBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-reel content-width">
            <iframe
              src={block.reelUrl?.replace("vimeo.com/", "player.vimeo.com/video/") + "?autoplay=1&loop=1&muted=0&controls=1"}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Reel"
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function ProjectPage({
  vimeoUrl,
  projectTitle,
  projectTag,
  projectInfo,
  pageBuilder,
  nextProjectTitle,
  nextProjectUrl,
}: ProjectPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = (e: WheelEvent) => {
      container.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, []);

  // Build vimeo embed URL
  const vimeoEmbed = vimeoUrl
    ? vimeoUrl.replace("vimeo.com/", "player.vimeo.com/video/") + "?autoplay=1&loop=1&muted=0&controls=1"
    : "";

  return (
    <div className="project-page-container" ref={containerRef}>
      {/* Main video section */}
      <div className="video-section bg-inverse">
        <div className="video-wrapper flex justify-center items-center">
          <div className="video-player-container">
            {vimeoEmbed && (
              <iframe
                src={vimeoEmbed}
                width="100%"
                height="100%"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={projectTitle}
              />
            )}
          </div>
          <div className="video-overlay-2">
            <div className="project-overview flex flex-col lg:flex-row justify-between w-full pl-6 lg:pl-0">
              <div className="project-title">{projectTitle}</div>
              <div className="project-info">
                {projectInfo.map((info, i) => (
                  <span key={i}>{info}{i < projectInfo.length - 1 && <br />}</span>
                ))}
                <div className="pill pill--ghost mt-4">{projectTag}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal page builder blocks */}
      <div className="horizontal-sections">
        {(pageBuilder || []).map((block, i) => renderBlock(block, i))}
      </div>

      {/* Next project */}
      <div className="next-project-section bg-inverse w-screen h-screen flex flex-col items-center justify-center">
        <p className="color-bg uppercase">Next Project</p>
        <h2
          data-text={nextProjectTitle}
          className="project-end color-bg glitch whitespace-normal lg:whitespace-nowrap my-12 text-center"
        >
          {nextProjectTitle}
        </h2>
        <div className="btn relative btn--ghost">
          <Link to={nextProjectUrl}>View Now
            <svg className="red-dot" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12.2603" cy="11.5" r="6.5" fill="#FF0B0B"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
