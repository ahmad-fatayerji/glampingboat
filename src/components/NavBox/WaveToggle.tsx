"use client";

import { useEffect, useRef } from "react";
import { useT } from "@/components/Language/useT";

interface WaveToggleProps {
  open: boolean;
  toggle: () => void;
}

const SIZE = 46;
const COLOR = "#E4DBCE";
const BASELINES = [14, 23, 32];

export default function WaveToggle({ open, toggle }: WaveToggleProps) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const drawStatic = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = COLOR;
      for (let i = 0; i < BASELINES.length; i++) {
        const y0 = BASELINES[i];
        ctx.beginPath();
        for (let x = 0; x <= SIZE; x++) {
          const y = y0 + Math.sin(x * 0.5 + i * 1.2) * 1.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    if (reduced) {
      drawStatic();
      return;
    }

    let intensity = 0;
    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      const target = hoverRef.current ? 1 : 0;
      intensity += (target - intensity) * 0.08;

      const time = (now - start) / 1000;
      const amp = 1.4 + intensity * 1.6;
      const speed = 1.4 + intensity * 1.8;
      const thickness = 2 + intensity * 0.4;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = COLOR;

      for (let i = 0; i < BASELINES.length; i++) {
        const y0 = BASELINES[i];
        const phase = time * speed + i * 1.05;
        ctx.beginPath();
        for (let x = 0; x <= SIZE; x++) {
          const k = x * 0.5;
          const y =
            y0 +
            Math.sin(k + phase) * amp +
            Math.sin(k * 0.55 + phase * 1.3) * amp * 0.45;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button
      onClick={toggle}
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      onFocus={() => {
        hoverRef.current = true;
      }}
      onBlur={() => {
        hoverRef.current = false;
      }}
      aria-label={open ? t("closeMenu") : t("openMenu")}
      className="fixed top-5 left-5 z-50 cursor-pointer bg-transparent p-2 scale-125"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ width: SIZE, height: SIZE, display: "block" }}
      />
    </button>
  );
}
