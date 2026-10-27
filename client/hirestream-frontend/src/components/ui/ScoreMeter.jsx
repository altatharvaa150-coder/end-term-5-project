export default function ScoreMeter({ score, max = 100, label, color }) {
  const pct = Math.min(100, (score / max) * 100);
  const getColor = () => {
    if (color) return color;
    if (pct >= 80) return "var(--success)";
    if (pct >= 60) return "var(--warning)";
    return "var(--danger)";
  };
  return (
    <div className="score-meter">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>}
        <span style={{ fontSize: 15, fontWeight: 700, color: getColor() }}>{score}{max !== 100 ? `/${max}` : "%"}</span>
      </div>
      <div className="score-bar">
        <div className="score-fill" style={{ width: `${pct}%`, background: getColor() }} />
      </div>
    </div>
  );
}
