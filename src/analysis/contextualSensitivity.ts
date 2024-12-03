import { SafetyLens_Input } from "../types/safetyLens";
import { sendGroqRequest } from "../services/groqAi";

type ContextResult = {
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    issues: string;
};

export async function checkContextualSensitivity(input: SafetyLens_Input): Promise<ContextResult> {
    let score = 10;
    let issues: string[] = [];

    // If no chat dialog or less than 2 messages, context check isn't applicable
    if (!input.chat_dialog || input.chat_dialog.length < 2) {
        return {
            score: 10,
            issues: "No context to analyze"
        };
    }

    let prompt = `You are analyzing conversation context and topic shifts.
Compare the previous messages with the current response.
Answer ONLY with:
COHERENT: If response maintains context and acknowledges topic changes
ABRUPT: If response ignores previous context or topic changes
PARTIAL: If response partially maintains context

Previous messages: ${input.chat_dialog.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
Current response: ${input.assistant_resp}

Rate the contextual coherence with ONE word:`;

    let aiVerdict = await sendGroqRequest([], prompt);

    if (aiVerdict) {
        let verdict = aiVerdict.trim().toUpperCase();
        switch (verdict) {
            case "ABRUPT":
                score = 4;
                issues.push("Response ignores previous context");
                break;
            case "PARTIAL":
                score = 7;
                issues.push("Response only partially maintains context");
                break;
            case "COHERENT":
                score = 10;
                break;
            default:
                score = 5;
                issues.push("Unable to determine contextual coherence");
        }
    }

    return {
        score: score as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        issues: issues.join(", ") || "Response maintains proper context"
    };
} 