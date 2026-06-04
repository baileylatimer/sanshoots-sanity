import { useEffect, useState } from "react";

export default function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", update);
    return () => window.removeEventListener("mousemove", update);
  }, []);

  return (
    <svg
      className="svg-cursor"
      width="27"
      height="28"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "fixed",
        top: pos.y,
        left: pos.x,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <g filter="url(#filter0_d_2496_676)">
        <path d="M10.9427 24.9998L7.02864 5.05092L25 14.8975L16.1476 17.4657L10.9427 24.9998Z" fill="white"/>
        <path d="M10.9427 24.9998L7.02864 5.05092L25 14.8975L16.1476 17.4657L10.9427 24.9998Z" stroke="black"/>
      </g>
      <defs>
        <filter id="filter0_d_2496_676" x="4.33057" y="3.10059" width="23.9663" height="26.1633" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="1"/>
          <feGaussianBlur stdDeviation="1"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2496_676"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2496_676" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}
