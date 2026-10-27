const STAGES = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];

export default function StageProgressBar({ currentStage }) {
  const currentIdx = STAGES.indexOf(currentStage);
  return (
    <div className="stage-progress" style={{ padding: "20px 0" }}>
      {STAGES.map((stage, idx) => (
        <div key={stage} className="stage-step">
          <div className={`stage-dot ${idx < currentIdx ? "completed" : idx === currentIdx ? "current" : ""}`}>
            {idx < currentIdx ? "✓" : idx + 1}
          </div>
          <span className={`stage-label ${idx === currentIdx ? "active" : ""}`}>{stage}</span>
        </div>
      ))}
    </div>
  );
}
