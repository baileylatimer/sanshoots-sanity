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

const CARD_W      = 1.8;   // sized so 12 cards (6 projects × 2) tile edge-to-edge at 30° each
const CARD_H      = 3.2;
const CARD_RADIUS = 0.20;
const RING_RADIUS = 3.5;   // CARD_W ≈ RING_RADIUS × (2π/12) → cards just touch
const CAMERA_Z    = 4.5;

// ── Drag / inertia / snap tunables ────────────────────────────────────────────
const DRAG_SENSITIVITY = 0.008;
const FLING_SCALE      = 0.4;
const MAX_VELOCITY     = 0.08;
const FRICTION         = 0.95;
const SNAP_THRESHOLD   = 0.002;
const SNAP_LERP        = 0.12;
const ENABLE_SNAP      = false; // TODO: flip to true to re-enable snap-to-front
const BEND_STRENGTH    = 1.0;   // 0 = flat, 1 = fully conformed to cylinder (wrapping look)
const MAX_DIM          = 0.7;   // max linear dim — bold to confirm rendering; dial back once visible
const MAX_BLUR         = 0.5;   // max uBlur value sent to shader (0 = sharp, 1 = fully blurred)
const FOCUS_ANGLE      = THREE.MathUtils.degToRad(50); // angular radius of "bright zone" around front
const DEBUG_DIM        = false; // set true to re-enable dim diagnostic logs

// ── Scroll-driven tilt / spin tunables ────────────────────────────────────────
const TILT_DEG           = 20;   // max X-axis tilt (ring tips up/down)
const SCROLL_ROTATE_TURNS = 0.5; // carousel turns per full scroll-through (0→1)
const SCROLL_SMOOTH      = 0.08; // lerp factor for tilt smoothing

// ── Texture URL helper ────────────────────────────────────────────────────────
function textureUrl(rawUrl: string): string {
  const sep = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${sep}w=900&auto=format&fit=max`;
}

// ── Error boundary ────────────────────────────────────────────────────────────
class TextureErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: unknown) {
    console.warn("[RingCard] texture load failed:", err);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ── Red dot (matches Header button) ──────────────────────────────────────────
function RedDot() {
  return (
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
  );
}

// ── Rounded-corner shader modifier (module-level = stable reference) ──────────
// Injects a 2-D rounded-rectangle SDF alpha mask into meshBasicMaterial.
// Uses position.xy (always available) to derive UVs — no USE_UV dependency.
function onBeforeCompileRounded(
  shader: Parameters<THREE.Material["onBeforeCompile"]>[0]
) {
  // ── Vertex: compute vRoundUv from local (flat) position ──────────────────
  shader.vertexShader =
    "varying vec2 vRoundUv;\n" + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    "void main() {",
    `void main() {
  // Use flat position for rounded-corner mask (before bending)
  vRoundUv = vec2(
    position.x / ${CARD_W.toFixed(4)} + 0.5,
    position.y / ${CARD_H.toFixed(4)} + 0.5
  );`
  );

  // ── Vertex: cylindrical bend — wrap card around ring axis ─────────────────
  // bendR = ring radius / strength; at strength=1 card conforms to cylinder.
  // As strength→0, bendR→∞ and the card becomes flat.
  const bendR = BEND_STRENGTH > 0
    ? (RING_RADIUS / BEND_STRENGTH).toFixed(6)
    : "999999.0";
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    `#include <begin_vertex>
  {
    float bendR = ${bendR};
    float a = position.x / bendR;
    transformed.x = bendR * sin(a);
    transformed.z += bendR * (cos(a) - 1.0);
  }`
  );

  // ── Fragment: rounded-rect SDF alpha mask + distance-based blur ───────────
  shader.uniforms.uBlur = { value: 0 };
  shader.fragmentShader =
    "uniform float uBlur;\nvarying vec2 vRoundUv;\n" + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <dithering_fragment>",
    `#include <dithering_fragment>
  {
    const float cW = ${CARD_W.toFixed(4)};
    const float cH = ${CARD_H.toFixed(4)};
    const float cR = ${CARD_RADIUS.toFixed(4)};
    vec2 p2 = (vRoundUv - 0.5) * vec2(cW, cH);
    vec2 q  = abs(p2) - vec2(cW, cH) * 0.5 + cR;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - cR;
    float aa   = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);
    gl_FragColor.a *= mask;
  }
  #ifdef USE_MAP
  if (uBlur > 0.001) {
    float bOff = uBlur * 0.005;
    vec3 blurSum = vec3(0.0);
    for (int bi = -1; bi <= 1; bi++) {
      for (int bj = -1; bj <= 1; bj++) {
        vec2 bUv = clamp(vRoundUv + vec2(float(bi), float(bj)) * bOff, 0.0, 1.0);
        vec3 s = texture2D(map, bUv).rgb;
        blurSum += pow(s, vec3(2.2));
      }
    }
    blurSum /= 9.0;
    blurSum *= diffuse;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, blurSum, uBlur);
  }
  #endif`
  );
}

// ── Card mesh ─────────────────────────────────────────────────────────────────
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
  const meshRef   = useRef<THREE.Mesh>(null!);
  const frameRef  = useRef(0);
  const shaderRef = useRef<{ uniforms: Record<string, { value: number }> } | null>(null);
  // Stable per-card wrapper: calls shared injector then records shader for uniform updates
  const onBC = useRef((s: Parameters<THREE.Material["onBeforeCompile"]>[0]) => {
    onBeforeCompileRounded(s);
    shaderRef.current = s as unknown as { uniforms: Record<string, { value: number }> };
  }).current;

  useFrame(() => {
    frameRef.current++;
    if (!meshRef.current) return;
    const totalAngle = angle + groupRotY.current;
    const x = Math.sin(totalAngle) * RING_RADIUS;
    const z = Math.cos(totalAngle) * RING_RADIUS - RING_RADIUS;
    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y = -totalAngle;
    const frontness = Math.cos(totalAngle);
    const scale = THREE.MathUtils.lerp(0.85, 1.0, (frontness + 1) / 2);
    meshRef.current.scale.setScalar(scale);
    // Angular-distance dim + blur: front = full brightness/sharp, ≥FOCUS_ANGLE = dim + blurred
    const ang = Math.acos(THREE.MathUtils.clamp(frontness, -1, 1));
    const dimT = THREE.MathUtils.clamp(ang / FOCUS_ANGLE, 0, 1);
    const brightness = 1 - MAX_DIM * dimT;
    if (map) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.setScalar(brightness);
      if (shaderRef.current) shaderRef.current.uniforms.uBlur.value = dimT * MAX_BLUR;
      // ── Diagnostic: log once per ~60 frames to validate dim mechanism ──
      if (DEBUG_DIM && frameRef.current % 60 === 0) {
        console.log("[dim]",
          "bright=", brightness.toFixed(3),
          "| colorReadback=", mat.color.getHexString(),
          "| isArray=", Array.isArray(meshRef.current.material),
          "| mapMatches=", mat.map === map,
          "| type=", mat.type,
          "| uuid=", mat.uuid.slice(0, 6),
        );
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {/* 40 width segments so the cylindrical bend is smooth */}
      <planeGeometry args={[CARD_W, CARD_H, 40, 1]} />
      <meshBasicMaterial
        key={map?.uuid ?? "placeholder"}
        map={map}
        color={map ? "white" : "#161616"}
        side={THREE.DoubleSide}
        toneMapped={false}
        transparent
        onBeforeCompile={onBC}
        customProgramCacheKey={() => `rounded-card-${BEND_STRENGTH}-${RING_RADIUS}`}
      />
    </mesh>
  );
}

// ── Loaded card (texture + optional video) ────────────────────────────────────
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
  const posterTex = useLoader(THREE.TextureLoader, url);
  posterTex.colorSpace = THREE.SRGBColorSpace;
  posterTex.anisotropy = 8;

  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const videoTexRef = useRef<THREE.VideoTexture | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const pointerDownPos = useRef<[number, number]>([0, 0]);

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

  useFrame(() => {
    if (videoTexRef.current && videoRef.current && !videoRef.current.paused) {
      videoTexRef.current.needsUpdate = true;
    }
  });

  const activeTex = videoReady && videoTexRef.current ? videoTexRef.current : posterTex;

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

// ── Card wrapper (error boundary + suspense) ──────────────────────────────────
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
  if (!project.posterImage?.asset?.url) return fallback;
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
  onActiveIndexChange,
  sectionRef,
}: {
  projects: RingProject[];
  isMobile: boolean;
  onNavigate: (to: string) => void;
  groupRotY: React.MutableRefObject<number>;
  velocity: React.MutableRefObject<number>;
  isDragging: React.MutableRefObject<boolean>;
  onActiveIndexChange: (idx: number) => void;
  sectionRef: React.RefObject<HTMLElement>;
}) {
  // Duplicate projects so 12 cards fill the ring (30° each → edge-to-edge at RING_RADIUS 3.5)
  const displayProjects = [...projects, ...projects];
  const angleStep    = (Math.PI * 2) / displayProjects.length;
  const lastActiveRef = useRef(-1);
  const tiltGroupRef  = useRef<THREE.Group>(null!);

  // Scroll state
  const smoothTilt = useRef(THREE.MathUtils.degToRad(TILT_DEG)); // start tilted
  const prevP      = useRef<number | null>(null);                 // previous scroll progress

  useFrame(() => {
    // ── Scroll progress ──────────────────────────────────────────────────────
    let dp = 0;
    let scrolling = false;
    if (sectionRef.current && typeof window !== "undefined") {
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      // p: 0 = entering (center at bottom), 0.5 = centered, 1 = leaving
      const p = Math.max(0, Math.min(1, 1 - sectionCenter / window.innerHeight));

      if (prevP.current === null) prevP.current = p; // init on first frame
      dp = p - prevP.current;
      prevP.current = p;
      scrolling = Math.abs(dp) > 0.0001;

      // Scroll drives carousel rotation (in-place, no translation)
      if (scrolling) {
        groupRotY.current += dp * SCROLL_ROTATE_TURNS * Math.PI * 2;
      }

      // Smooth tilt toward target
      const tiltTarget = THREE.MathUtils.degToRad(TILT_DEG) * (1 - 2 * p);
      smoothTilt.current = THREE.MathUtils.lerp(smoothTilt.current, tiltTarget, SCROLL_SMOOTH);
    }

    // Apply tilt to parent group (X only — no Y drift)
    if (tiltGroupRef.current) {
      tiltGroupRef.current.rotation.x = smoothTilt.current;
    }

    // ── Drag inertia + snap (skip snap while actively scrolling) ─────────────
    if (!isDragging.current) {
      groupRotY.current += velocity.current;
      velocity.current  *= FRICTION;

      if (ENABLE_SNAP && !scrolling && Math.abs(velocity.current) < SNAP_THRESHOLD) {
        velocity.current = 0;
        const target = Math.round(groupRotY.current / angleStep) * angleStep;
        groupRotY.current = THREE.MathUtils.lerp(groupRotY.current, target, SNAP_LERP);
        if (Math.abs(target - groupRotY.current) < 0.0005) groupRotY.current = target;
      }
    }

    // ── Active card detection ────────────────────────────────────────────────
    const raw = Math.round(-groupRotY.current / angleStep);
    const displayIdx = ((raw % displayProjects.length) + displayProjects.length) % displayProjects.length;
    const idx = displayIdx % projects.length;
    if (idx !== lastActiveRef.current) {
      lastActiveRef.current = idx;
      onActiveIndexChange(idx);
    }
  });

  return (
    <group ref={tiltGroupRef} scale={isMobile ? 0.86 : 1}>
      {displayProjects.map((project, i) => (
        <RingCard
          key={`${project._id}-${i}`}
          project={project}
          angle={i * angleStep}
          groupRotY={groupRotY}
          isMobile={isMobile}
          onNavigate={onNavigate}
        />
      ))}
    </group>
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
  } catch { return false; }
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
  const [mounted, setMounted]     = useState(false);
  const [webglOk, setWebglOk]     = useState(true);
  const [isMobile, setIsMobile]   = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate    = useNavigate();
  const groupRotY   = useRef(0);
  const velocity    = useRef(0);
  const isDragging  = useRef(false);
  const sectionRef  = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    setWebglOk(isWebGLAvailable());
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bind = useGesture({
    onDrag: ({ delta: [dx], last, velocity: [vx], direction: [dirx] }) => {
      isDragging.current = true;
      groupRotY.current += dx * DRAG_SENSITIVITY * (isMobile ? 0.75 : 0.65);
      if (last) {
        isDragging.current = false;
        const fling = dirx * vx * FLING_SCALE;
        velocity.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, fling));
      }
    },
  });

  const handleNavigate = useCallback((to: string) => navigate(to), [navigate]);
  const handleActiveIndexChange = useCallback((idx: number) => setActiveIndex(idx), []);

  const activeProject = projects[activeIndex] ?? null;

  if (!mounted) return <div style={{ height: "80vh" }} />;

  if (projects.length === 0) {
    return (
      <section className="relative flex items-center justify-center" style={{ height: "80vh" }}>
        <p className="font-mono text-xs opacity-40 uppercase tracking-widest">
          No featured projects — add some in Sanity Studio
        </p>
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ring-title-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ring-title-in { animation: ring-title-in 0.3s ease forwards; }
      `}</style>

      <section
        ref={sectionRef as React.RefObject<HTMLElement>}
        className="relative overflow-hidden"
        style={{ height: "80vh" }}
      >
        {targetImageUrl && (
          <img
            src={targetImageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-60"
            style={{ zIndex: 0 }}
          />
        )}

        {/* Top-left label — matches Services h5 (ShreckMono 68px) */}
        <div className="absolute top-6 left-0 px-d pointer-events-none" style={{ zIndex: 10 }}>
          <h5>Selected Works</h5>
        </div>

        {/* Canvas */}
        <div
          className="absolute inset-0"
          style={{ zIndex: 1, touchAction: "none" }}
          {...bind()}
        >
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
                onActiveIndexChange={handleActiveIndexChange}
                sectionRef={sectionRef as React.RefObject<HTMLElement>}
              />
            </Canvas>
          ) : (
            <FallbackGrid projects={projects} />
          )}
        </div>

        {/* Bottom bar: View All (left) ←→ title + tag (right) */}
        <div
          className="absolute bottom-6 left-0 right-0 px-d flex justify-between items-end pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Left: dark .btn with red dot */}
          <div className="btn relative pointer-events-auto">
            <Link to="/showreel">View All <RedDot /></Link>
          </div>

          {/* Right: active project title (ShreckMono h5) + tag pill */}
          {activeProject && (
            <div className="flex flex-col items-end gap-2">
              <h5
                key={activeIndex}
                className="ring-title-in"
                style={{ margin: 0 }}
              >
                {activeProject.title}
              </h5>
              {activeProject.tag && (
                <div
                  key={`tag-${activeIndex}`}
                  className="ring-title-in tag"
                  style={{ borderColor: "var(--color-contrast-higher)" }}
                >
                  <p style={{ margin: 0 }}>{activeProject.tag}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
