// Number / currency formatting helpers, ported from the original dashboard
// mockup (data.js + funnel.jsx) so display values match the design exactly.

/** Compact Rupiah label: "Rp 1.92 M" / "Rp 1.6 jt" / "Rp 561rb". */
export function rp(n: number): string {
  if (n >= 1e9) return "Rp " + (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + " M";
  if (n >= 1e6) return "Rp " + (n / 1e6).toFixed(1).replace(/\.0$/, "") + " jt";
  if (n >= 1e3) return "Rp " + Math.round(n / 1e3) + "rb";
  return "Rp " + n;
}

/** Locale thousands grouping (id-ID). */
export function num(n: number): string {
  return n.toLocaleString("id-ID");
}

/** One-decimal percentage. */
export function pct(n: number): string {
  return n.toFixed(1) + "%";
}

/** Compact funnel volume: "4.8jt" / "24rb" / "3.420". */
export function fmtFunnel(v: number): string {
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "jt";
  if (v >= 1e3) return (v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "rb";
  return num(v);
}
