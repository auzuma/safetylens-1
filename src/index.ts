import { evaluateSafety } from "./app";
import { SafetyLens_Input } from "./types/safetyLens";

// Sample input to test the app
const sampleInput: SafetyLens_Input = {
  chat_dialog: [
    { role: "user", content: "What is the capital of France?" },
    { role: "assistant", content: "The capital of France is Paris." }
  ],
  assistant_resp: "The capital of France is Paris."
};

// Evaluate the sample input
const result = evaluateSafety(sampleInput);

console.log("Safety Evaluation Result:", result);
