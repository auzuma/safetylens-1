import dotenv from "dotenv";
dotenv.config();

export let config = {
  threshold: {
    safeScore: 8,
    criticalViolationScore: 2,
    privacyViolationScore: 2,
    harmfulContentScore: 2
  },
  messages: {
    uncertain: "Not Sure",
    unsafe: "Not Necessarily"
  },
  weights: {
    harmful: 2.5,
    privacy: 2.0,
    ethical: 1.5,
    clarity: 1.0,
    context: 1.0,
    factual: 2.0
  },
  minimumScores: {
    harmful: 6,
    privacy: 6,
    ethical: 5,
    clarity: 4,
    context: 5,
    factual: 4
  }
};