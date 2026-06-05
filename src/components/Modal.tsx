import { useEffect } from "react";
import type { ReactNode } from "react";

export interface DrillData {
  title: string;
  body: ReactNode;
}

/** Drilldown modal — closes on Esc or scrim click. */
export function Modal({ data, onClose }: { data: DrillData | null; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!data) return null;
  return (
    <div className="gp-modal-scrim" onClick={onClose}>
      <div className="gp-modal" onClick={(e) => e.stopPropagation()}>
        <header className="gp-modal-head">
          <h2>{data.title}</h2>
          <button className="gp-modal-x" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </header>
        <div className="gp-modal-body">{data.body}</div>
        <footer className="gp-modal-foot">
          <span>Drilldown · data ilustratif</span>
          <button onClick={onClose}>Tutup (Esc)</button>
        </footer>
      </div>
    </div>
  );
}
