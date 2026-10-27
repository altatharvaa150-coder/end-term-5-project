const stageBadgeMap = {
  Applied: "badge-applied",
  Screening: "badge-screening",
  Assessment: "badge-assessment",
  Interview: "badge-interview",
  Offer: "badge-offer",
  Hired: "badge-hired",
};
const statusBadgeMap = {
  active: "badge-active",
  rejected: "badge-rejected",
  hired: "badge-hired",
  withdrawn: "badge-assessment",
};
const recBadgeMap = {
  strong_hire: "badge-strong-hire",
  hire: "badge-hire",
  lean_hire: "badge-lean-hire",
  no_hire: "badge-no-hire",
  strong_no_hire: "badge-rejected",
  pending: "badge-pending",
};
const recLabels = {
  strong_hire: "Strong Hire",
  hire: "Hire",
  lean_hire: "Lean Hire",
  no_hire: "No Hire",
  strong_no_hire: "Strong No Hire",
  pending: "Pending",
};

export const StageBadge = ({ stage }) => (
  <span className={`badge ${stageBadgeMap[stage] || "badge-applied"}`}>{stage}</span>
);
export const StatusBadge = ({ status }) => (
  <span className={`badge ${statusBadgeMap[status] || "badge-active"}`} style={{ textTransform: "capitalize" }}>{status}</span>
);
export const RecommendationBadge = ({ rec }) => (
  <span className={`badge ${recBadgeMap[rec] || "badge-pending"}`}>{recLabels[rec] || rec}</span>
);
