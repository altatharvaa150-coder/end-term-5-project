/**
 * Calculate assessment score from submitted answers vs correct answers
 * Returns percentage score
 */
export const calculateAssessmentScore = (questions, answers) => {
  if (!questions || !answers || questions.length === 0) return 0;

  let earnedPoints = 0;
  let totalPoints = 0;

  questions.forEach((q, index) => {
    totalPoints += q.points || 10;
    if (q.type === "mcq" && answers[index] !== undefined) {
      if (answers[index].trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
        earnedPoints += q.points || 10;
      }
    } else if (q.type === "text" && answers[index]) {
      // Text answers get partial credit if answered (graded manually later if needed)
      earnedPoints += Math.floor((q.points || 10) * 0.5);
    }
  });

  if (totalPoints === 0) return 0;
  return parseFloat(((earnedPoints / totalPoints) * 100).toFixed(2));
};

/**
 * Determine recommendation based on assessment score
 */
export const getRecommendation = (score) => {
  if (score >= 85) return "strong_hire";
  if (score >= 70) return "hire";
  if (score >= 55) return "lean_hire";
  if (score >= 40) return "no_hire";
  return "strong_no_hire";
};

/**
 * Calculate weighted evaluation score from criteria
 */
export const calculateWeightedScore = (criteria) => {
  if (!criteria || criteria.length === 0) return 0;
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const weighted = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);
  return parseFloat((weighted / totalWeight).toFixed(2));
};

/**
 * Get stage order index (for state machine validation)
 */
const STAGES = ["Applied", "Screening", "Assessment", "Interview", "Offer", "Hired"];
export const getStageIndex = (stage) => STAGES.indexOf(stage);
export const isValidStageTransition = (from, to) => {
  const fromIdx = getStageIndex(from);
  const toIdx = getStageIndex(to);
  return toIdx === fromIdx + 1 || toIdx === fromIdx - 1; // forward or one back
};
export const PIPELINE_STAGES = STAGES;
