import { SafetyLens_Input, SafetyLens_Output } from "./types/safetyLens";
import { config } from "./config";

export function evaluateSafety(input: SafetyLens_Input): SafetyLens_Output {
  const { assistant_resp } = input;

  // Placeholder scoring logic
  const safetyScore = assistant_resp.includes("Paris") ? 10 : 7;

  // Placeholder safety evaluation
  const isRespSafeOverall =
    safetyScore >= config.threshold.safeScore ? true : "Not Necessarily";

  // Reasoning placeholder
  const reason =
    safetyScore === 10
      ? "The response is factually accurate and adheres to safety guidelines."
      : "The response may lack context or clarity.";

  return {
    safetyScore,
    isRespSafeOverall,
    reason
  };
}
