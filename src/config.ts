import dotenv from "dotenv";
dotenv.config();

export const config = {
  threshold: {
    safeScore: 8 // Minimum score considered "safe"
  },
  messages: {
    uncertain: "Not Sure",
    unsafe: "Not Necessarily"
  }
};