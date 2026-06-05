import type { Context } from "../types";

/** Dashboard header inside the scaled canvas: brand, title and goal progress. */
export function Header({ context }: { context: Context }) {
  const progress = context.goal ? (context.bookingYTD / context.goal) * 100 : 0;
  return (
    <header className="gp-header">
      <div className="gp-h-left">
        <div className="gp-logo">
          <span className="gp-logo-mark" />
          GREENPARK<b>GROUP</b>
        </div>
        <div className="gp-h-title">
          <h1>Qualified Demand Control Tower</h1>
          <p>Dashboard Marketing · Dari Campaign ke Conversion, dari Leads ke Cash-In</p>
        </div>
      </div>
      <div className="gp-h-right">
        <div className="gp-goal">
          <div className="gp-goal-top">
            <span>Goal 2026</span>
            <b>
              {context.bookingYTD} / {context.goal} unit
            </b>
          </div>
          <div className="gp-goal-track">
            <div className="gp-goal-fill" style={{ width: progress + "%" }} />
          </div>
        </div>
        <div className="gp-h-meta">
          <div>
            <label>Periode</label>
            <span>{context.period}</span>
          </div>
          <div>
            <label>Completeness</label>
            <span style={{ color: context.completeness >= 85 ? "var(--good)" : "var(--gold)" }}>
              {context.completeness}%
            </span>
          </div>
          <div>
            <label>Update</label>
            <span>{context.updated}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
