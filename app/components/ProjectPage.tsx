import { useEffect, useRef } from "react";
import { Link } from "@remix-run/react";
import Header from "./Header";
import Cursor from "./Cursor";

interface PageBuilderBlock {
  _type: string;
  _key: string;
  /** New single-field title text (preferred) */
  text?: string;
  /** Legacy multi-line array — kept for backwards compat with migrated data */
  headingLines?: string[];
  image?: { asset?: { url: string } };
  alt?: string;
  heading?: string;
  images?: Array<{ asset?: { url: string }; _key: string }>;
  reelUrl?: string;
  useExtraSmall?: boolean;
}

interface NextProject {
  title?: string;
  slug?: { current?: string };
  category?: string;
}

interface ProjectPageProps {
  title: string;
  projectVideo?: string | null;
  vimeoUrl?: string;
  tag?: string;
  location?: string;
  coordinates?: string;
  pageBuilder: PageBuilderBlock[];
  nextProject?: NextProject | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function renderBlock(block: PageBuilderBlock, _index: number) {
  const isSmallWidth = block._type === "imageBlock" || block._type === "paragraphBlock";
  const isExtraSmall = block._type === "reelBlock" && block.useExtraSmall !== false;

  let detailClass = "project-detail";
  if (isExtraSmall) detailClass += " project-detail--xs";
  else if (isSmallWidth) detailClass += " project-detail--sm";

  switch (block._type) {
    case "titleBlock": {
      // Prefer new single `text` field; fall back to legacy headingLines array
      const titleText = block.text ?? (block.headingLines ?? []).join("\n");
      return (
        <div key={block._key} className={detailClass}>
          <div className="content-width">
            {/* white-space: pre-line turns \n into line breaks without wrapper spans,
                so the h3's Rayuela font-family applies directly to the text */}
            <h3 className="text-center" style={{ whiteSpace: "pre-line" }}>
              {titleText}
            </h3>
          </div>
        </div>
      );
    }

    case "imageBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-image">
            <img src={block.image?.asset?.url ?? ""} alt={block.alt ?? ""} />
          </div>
        </div>
      );

    case "imageTextBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-image-text flex gap-24 ml-24">
            <div className="flex flex-col pl-96 px-36">
              <h3>{block.heading}</h3>
              <p>{block.text}</p>
            </div>
            <img src={block.image?.asset?.url ?? ""} alt={block.alt ?? ""} />
          </div>
        </div>
      );

    case "galleryBlock":
      return (
        <div key={block._key} className={detailClass}>
          <div className="layout-gallery flex flex-col md:flex-row gap-4 h-full">
            <div className="w-full md:w-1/2 h-1/2 md:h-full">
              <img src={block.images?.[0]?.asset?.url ?? ""} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4 h-1/2 md:h-full">
              <div className="h-1/2">
                <img src={block.images?.[1]?.asset?.url ?? ""} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="h-1/2 flex gap-4">
                <div className="w-1/2 h-full">
                  <img src={block.images?.[2]?.asset?.url ?? ""} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="w-1/2 h-full">
                  <img src={block.images?.[3]?.asset?.url ?? ""} alt="" className="w-full h-full object-cover" />
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
              src={
                block.reelUrl
                  ? block.reelUrl.replace("vimeo.com/", "player.vimeo.com/video/") +
                    "?autoplay=1&loop=1&muted=0&controls=1"
                  : ""
              }
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
  title,
  projectVideo,
  vimeoUrl,
  tag,
  location,
  coordinates,
  pageBuilder,
  nextProject,
}: ProjectPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const projectInfo = [location, coordinates].filter((v): v is string => Boolean(v));

  const nextProjectTitle = nextProject?.title ?? "";
  const nextProjectUrl =
    nextProject?.slug?.current && nextProject?.category
      ? `/${nextProject.category}/${nextProject.slug.current}`
      : null;

  // Lock body scroll so wheel events go to horizontal container
  useEffect(() => {
    document.body.classList.add("project-page");
    return () => document.body.classList.remove("project-page");
  }, []);

  // Convert vertical wheel → horizontal scroll.
  // If the user is already swiping horizontally (trackpad), let the browser handle it.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      // Horizontal trackpad gesture — let browser handle natively
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const vimeoEmbed = vimeoUrl
    ? vimeoUrl.replace("vimeo.com/", "player.vimeo.com/video/") + "?autoplay=1&loop=1&muted=0&controls=1"
    : "";

  return (
    <>
      <Cursor />
      <Header />
      <div className="project-page-container" ref={containerRef}>
      {/* ── Hero video section ── */}
      <div className="video-section bg-inverse">
        <div className="video-wrapper">
          {projectVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              className="project-video-native"
              src={projectVideo}
              autoPlay
              loop
              controls
              playsInline
            />
          ) : vimeoEmbed ? (
            <div className="video-player-container">
              <iframe
                src={vimeoEmbed}
                width="100%"
                height="100%"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          ) : null}
          {/* Bottom overlay: title on left, info stack on right */}
          <div className="project-overview">
            <div className="project-title">{title}</div>
            <div className="project-info-stack">
              {projectInfo.map((info, i) => (
                <p key={i} className="color-bg m-0">{info}</p>
              ))}
              {tag && <div className="pill pill--ghost mt-2">{tag}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Page builder cards — direct flex children of scroll container ── */}
      {(pageBuilder ?? []).map((block, i) => renderBlock(block, i))}

      {/* ── Next project ── */}
      {nextProjectUrl && (
        <div className="next-project-section bg-inverse flex flex-col items-center justify-center">
          <p className="color-bg uppercase">Next Project</p>
          <h2
            data-text={nextProjectTitle}
            className="project-end color-bg glitch whitespace-normal lg:whitespace-nowrap my-12 text-center"
          >
            {nextProjectTitle}
          </h2>
          <div className="btn relative btn--ghost">
            <Link to={nextProjectUrl}>
              View Now
              <svg
                className="red-dot"
                width="24"
                height="23"
                viewBox="0 0 24 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12.2603" cy="11.5" r="6.5" fill="#FF0B0B" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
