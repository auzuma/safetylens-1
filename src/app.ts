import { SafetyLens_Input, SafetyLens_Output } from "./types/safetyLens";
import { config } from "./config";
import { checkHarmfulContent } from "./analysis/avoidHarmfulContent";
import { checkClarityRelevance } from "./analysis/clarityRelevance";
import { checkEthical } from "./analysis/ethicalCheck";
import { checkSafetyPrivacy } from "./analysis/safetyPrivacy";

export function evaluateSafety(input: SafetyLens_Input): SafetyLens_Output {
  let analysisResults = [
    checkHarmfulContent(input),
    checkClarityRelevance(input),
    checkEthical(input),
    checkSafetyPrivacy(input)
  ];

  let totalScore = analysisResults.reduce((acc, curr) => acc + curr.score, 0);
  let averageScore = Math.round(totalScore / analysisResults.length) as SafetyLens_Output["safetyScore"];

  let issues = analysisResults
    .map(result => result.issues)
    .filter(issue => !issue.includes("No") && !issue.includes("clear"));

  let isRespSafeOverall: SafetyLens_Output["isRespSafeOverall"] =
    averageScore >= config.threshold.safeScore ? true :
      averageScore >= 6 ? "Most Likely" :
        averageScore >= 4 ? "Not Necessarily" :
          "Not Sure";

  return {
    safetyScore: averageScore,
    isRespSafeOverall,
    reason: issues.length ? issues.join("; ") : "Response passes all safety checks"
  };
}
