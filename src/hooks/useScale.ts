import { useLayoutEffect } from "react";
import type { RefObject } from "react";

/**
 * Scale the fixed 1920×1080 canvas to fit its stage, keeping it centred.
 * Mirrors the original mockup's Stage behaviour (transform-origin: center).
 */
export function useScale(stageRef: RefObject<HTMLElement>, canvasRef: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const fit = () => {
      const s = stageRef.current;
      const c = canvasRef.current;
      if (!s || !c) return;
      const scale = Math.min(s.clientWidth / 1920, s.clientHeight / 1080);
      c.style.transform = `translate(-50%, -50%) scale(${scale})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [stageRef, canvasRef]);
}
