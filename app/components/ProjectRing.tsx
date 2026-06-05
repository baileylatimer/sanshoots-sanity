/* eslint-disable react/no-unknown-property */
import {
  Suspense,
  useRef,
  useState,
  useCallback,
  useEffect,
  Component,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@remix-run/react";
import { Canvas, useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";

export interface RingProject {
  _id: string;
  title: string;
  tag: string;
  slug: { current: string };
  category: string;
  posterImage: { asset: { url: string } } | null;
  mp4Src: string | null;
  webmSrc: string | null;
  linkTo: string;
}

const CARD_W = 1.7;
const CARD_H = 3.0;
const RING_RADIUS = 2.5;
const CAMERA_Z = 4.5;

// ── Texture URL helper ────────────────────────────────────────────────────────
// Sizes the Sanity image for use as a WebGL texture (full-res posters are huge),
// and gives the texture request a cache key distinct from any plain <img> usage —
// this avoids a cached non-CORS response breaking the crossOrigin texture load.
function textureUrl(rawUrl: string): string {
  const sep = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${sep}w=900&auto=format&fit=max`;
}

// ── Error boundary ────────────────────────────────────────────────────────────
// Suspense catches the *loading* state but NOT load *errors* — a rejected texture
// would otherwise throw straight through and crash the entire <Canvas>. This
// degrades a single failed card to its placeholder instead.
class TextureErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    console.warn("[RingCard] texture load failed, showing placeholder:", err);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ── Placeholder card (shown while texture loads or if it fails / has no URL) ──
function CardMesh({
  angle,
  groupRotY,
  map,
  onPointerOver,
  onPointerOut,
  onPointerDown,
  onPointerUp,
}: {
  angle: number;
  groupRotY: React.MutableRefObject<number>;
  map?: THREE.Texture;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current) return;
    const totalAngle = angle + groupRotY.current;
    const x = Math.sin(totalAngle) * RING_RADIUS;
    const z = Math.cos(totalAngle) * RING_RADIUS - RING_RADIUS;
    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y = -totalAngle;
    const frontness = Math.cos(totalAngle);
    const scale = THREE.MathUtils.lerp(0.85, 1.0, (frontness + 1) / 2);
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <planeGeometry args={[CARD_W, CARD_H]} />
      <meshBasicMaterial
        key={map?.uuid ?? "placeholder"}
        map={map}
        color={map ? "white" : "#161616"}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

// ── Card that loads its own texture via useLoader (Suspense-compatible) ───────
function RingCardLoaded({
  project,
  angle,
  groupRotY,
  isMobile,
  onNavigate,
}: {
  project: RingProject;
  angle: number;
  groupRotY: React.MutableRefObject<number>;
  isMobile: boolean;
  onNavigate: (to: string) => void;
}) {
  const url = textureUrl(project.posterImage!.asset.url);
  // useLoader suspends until the texture is ready. If it rejects, the
  // TextureErrorBoundary above catches it and renders the placeholder.
  const posterTex = useLoader(THREE.TextureLoader, url);
  posterTex.colorSpace = THREE.SRGBColorSpace;
  posterTex.anisotropy = 8;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTexRef = useRef<THREE.VideoTexture | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const pointerDownPos = useRef<[number, number]>([0, 0]);

  // Video setup — only on desktop
  useEffect(() => {
    if (isMobile || !project.mp4Src) return;
    const vid = document.createElement("video");
    vid.crossOrigin = "anonymous";
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.preload = "none";
    const s = document.createElement("source");
    s.src = project.mp4Src;
    s.type = "video/mp4";
    vid.appendChild(s);
    vid.addEventListener("loadeddata", () => setVideoReady(true));
    videoRef.current = vid;
    const tex = new THREE.VideoTexture(vid);
    tex.colorSpace = THREE.SRGBColorSpace;
    videoTexRef.current = tex;
    return () => {
      vid.pause();
      vid.src = "";
      tex.dispose();
      videoRef.current = null;
      videoTexRef.current = null;
      setVideoReady(false);
    };
  }, [isMobile, project.mp4Src]);

  // Tick video texture
  useFrame(() => {
    if (videoTexRef.current && videoRef.current && !videoRef.current.paused) {
      videoTexRef.current.needsUpdate = true;
    }
  });

  const activeTex =
    videoReady && videoTexRef.current ? videoTexRef.current : posterTex;

  const handlePointerOver = useCallback(() => {
    if (isMobile || !videoRef.current) return;
    videoRef.current.load();
    videoRef.current.play().catch(() => {});
  }, [isMobile]);

  const handlePointerOut = useCallback(() => {
    if (isMobile || !videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setVideoReady(false);
  }, [isMobile]);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    pointerDownPos.current = [e.clientX, e.clientY];
  }, []);

  const handlePointerUp = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const dx = e.clientX - pointerDownPos.current[0];
      const dy = e.clientY - pointerDownPos.current[1];
      if (Math.sqrt(dx * dx + dy * dy) < 6) onNavigate(project.linkTo);
    },
    [project.linkTo, onNavigate]
  );

  return (
    <CardMesh
      angle={angle}
      groupRotY={groupRotY}
      map={activeTex}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    />
  );
}

// ── Wrapper: ErrorBoundary + Suspense → placeholder, loaded = real card ───────
function RingCard({
  project,
  angle,
  groupRotY,
  isMobile,
  onNavigate,
}: {
  project: RingProject;
  angle: number;
  groupRotY: React.MutableRefObject<number>;
  isMobile: boolean;
  onNavigate: (to: string) => void;
}) {
  const fallback = <CardMesh angle={angle} groupRotY={groupRotY} />;

  if (!project.posterImage?.asset?.url) {
    console.warn("[RingCard] No posterImage for:", project.title);
    return fallback;
  }

  return (
    <TextureErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <RingCardLoaded
          project={project}
          angle={angle}
          groupRotY={groupRotY}
          isMobile={isMobile}
          onNavigate={onNavigate}
        />
      </Suspense>
    </TextureErrorBoundary>
  );
}

// ── Ring group ────────────────────────────────────────────────────────────────
function RingGroup({
  projects,
  isMobile,
  onNavigate,
  groupRotY,
  velocity,
  isDragging,
}: {
  projects: RingProject[];
  isMobile: boolean;
  onNavigate: (to: string) => void;
  groupRotY: React.MutableRefObject<number>;
  velocity: React.MutableRefObject<number>;
  isDragging: React.MutableRefObject<boolean>;
}) {
  const angleStep = (Math.PI * 2) / projects.length;

  useFrame(() => {
    if (!isDragging.current) {
      velocity.current *= 0.93;
      groupRotY.current += velocity.current;
    }
  });

  return (
    <>
      {projects.map((project, i) => (
        <RingCard
          key={project._id}
          project={project}
          angle={i * angleStep}
          groupRotY={groupRotY}
          isMobile={isMobile}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
}

// ── WebGL check ───────────────────────────────────────────────────────────────
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ── HTML fallback grid ────────────────────────────────────────────────────────
function FallbackGrid({ projects }: { projects: RingProject[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-d py-8">
      {projects.map((p) => (
        <Link key={p._id} to={p.linkTo} className="group block">
          <div className="aspect-[9/16] overflow-hidden rounded-lg bg-neutral-900">
            {p.posterImage?.asset?.url && (
              <img
                src={p.posterImage.asset.url}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
          </div>
          <p className="mt-2 text-sm font-mono">{p.title}</p>
        </Link>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ProjectRing({
  projects,
  targetImageUrl,
}: {
  projects: RingProject[];
  targetImageUrl?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const groupRotY = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    setMounted(true);
    setWebglOk(isWebGLAvailable());
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bind = useGesture({
    onDrag: ({ delta: [dx], first, last }) => {
      if (first) isDragging.current = true;
      velocity.current = dx * 0.008;
      groupRotY.current += dx * 0.008;
      if (last) isDragging.current = false;
    },
  });

  const handleNavigate = useCallback((to: string) => navigate(to), [navigate]);

  if (!mounted) return <div style={{ height: "80vh" }} />;

  if (projects.length === 0) {
    return (
      <section className="relative flex items-center justify-center" style={{ height: "80vh" }}>
        <p className="font-mono text-xs opacity-40 uppercase tracking-widest">
          No featured projects — add some in Sanity Studio → Home Page
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden" style={{ height: "80vh" }}>
      {targetImageUrl && (
        <img
          src={targetImageUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-60"
          style={{ zIndex: 0 }}
        />
      )}

      <div className="absolute top-6 left-0 px-d pointer-events-none" style={{ zIndex: 10 }}>
        <h5 className="text-xs font-mono tracking-widest uppercase opacity-70">Selected Works</h5>
      </div>

      <div className="absolute inset-0" style={{ zIndex: 1, touchAction: "none" }} {...bind()}>
        {webglOk ? (
          <Canvas
            camera={{ position: [0, 0, CAMERA_Z], fov: 55 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: "transparent", cursor: "grab" }}
          >
            <ambientLight intensity={1.0} />
            <RingGroup
              projects={projects}
              isMobile={isMobile}
              onNavigate={handleNavigate}
              groupRotY={groupRotY}
              velocity={velocity}
              isDragging={isDragging}
            />
          </Canvas>
        ) : (
          <FallbackGrid projects={projects} />
        )}
      </div>

      <div className="absolute bottom-6 right-0 px-d" style={{ zIndex: 10 }}>
        <Link
          to="/showreel"
          className="btn-primary flex items-center gap-2 text-xs font-mono tracking-widest uppercase"
        >
          View All
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
        </Link>
      </div>
    </section>
  );
}