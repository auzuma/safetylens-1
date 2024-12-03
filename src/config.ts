import dotenv from "dotenv";
dotenv.config();

export let config = {
  threshold: {
    safeScore: 9,
    criticalViolationScore: 3,
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
    clarity: 1.0
  }
};