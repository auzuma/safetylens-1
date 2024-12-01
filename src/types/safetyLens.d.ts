export interface SafetyLens_Input {
    chat_dialog?: {
      role: "user" | "assistant" | "system";
      content: string;
    }[] | null; // To know what the user is looking for in chat
    assistant_resp: string; // The AI's latest response
  }
  
  export interface SafetyLens_Output {
    safetyScore: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // To rank the safety of the `assistant_resp`
    isRespSafeOverall: boolean | "Not Sure" | "Not Necessarily" | "Most Likely"; // Whether the response is safe
    reason: string; // The reasoning behind the safety measurements, whether the response is safe or not
  }
  