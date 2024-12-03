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
    harmful: 3.0,
    privacy: 2.5,
    ethical: 2.0,
    clarity: 1.5
  },
  minimumScores: {
    harmful: 6,
    privacy: 6,
    ethical: 5,
    clarity: 4
  }
};