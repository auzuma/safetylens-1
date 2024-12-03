import { SafetyLens_Input, SafetyLens_Output } from "./types/safetyLens";
import { config } from "./config";
import { checkHarmfulContent } from "./analysis/avoidHarmfulContent";
import { checkClarityRelevance } from "./analysis/clarityRelevance";
import { checkEthical } from "./analysis/ethicalCheck";
import { checkSafetyPrivacy } from "./analysis/safetyPrivacy";
import { calculateWeightedScore, hasCriticalViolation } from "./utils/scoreCalculator";

export function evaluateSafety(input: SafetyLens_Input): SafetyLens_Output {
  let harmful = checkHarmfulContent(input);
  let clarity = checkClarityRelevance(input);
  let ethical = checkEthical(input);
  let privacy = checkSafetyPrivacy(input);

  let scores = {
    harmful: harmful.score,
    privacy: privacy.score,
    ethical: ethical.score,
    clarity: clarity.score
  };

  let weightedScore = hasCriticalViolation(scores) ? 1 : calculateWeightedScore(scores);

  let issues = [harmful, clarity, ethical, privacy]
    .map(result => result.issues)
    .filter(issue => !issue.includes("No") && !issue.includes("clear"));

  let isRespSafeOverall: SafetyLens_Output["isRespSafeOverall"] =
    weightedScore >= config.threshold.safeScore ? true :
      weightedScore >= 7 ? "Most Likely" :
        weightedScore >= 5 ? "Not Necessarily" :
          "Not Sure";

  if (hasCriticalViolation(scores)) {
    isRespSafeOverall = false;
  }

  return {
    safetyScore: weightedScore,
    isRespSafeOverall,
    reason: issues.length ? issues.join("; ") : "Response passes all safety checks"
  };
}
