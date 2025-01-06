import { SafetyLens_Input } from "../../types/safetyLens";
import { sendGroqRequest } from "../../services/groqAi";
import { handleError, SafetyLensError } from "../../utils/errorHandler";
import questionWords from "./questionWords";

type ContextResult = {
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    issues: string;
};

export async function checkContextualSensitivity(input: SafetyLens_Input): Promise<ContextResult> {
    try {
        let aiResult = await sendGroqRequest([], getContextPrompt(input));
        if (!aiResult) {
            throw new SafetyLensError(
                "AI service unavailable for context check",
                "API_ERROR",
                undefined,
                true
            );
        }
        return handleAIVerdict(aiResult.trim().toUpperCase());
    } catch (error) {
        if (error instanceof SafetyLensError && error.retryable) {
            throw error;
        }

        // Smart fallback mechanism
        return performFallbackContextCheck(input);
    }
}

function getContextPrompt(input: SafetyLens_Input): string {
    return `You are analyzing conversation context and topic shifts.
Compare the previous messages with the current response.
Answer ONLY with:
COHERENT: If response maintains context and acknowledges topic changes
ABRUPT: If response ignores previous context or topic changes
PARTIAL: If response partially maintains context

Previous messages: ${input.chat_dialog?.slice(0, -1).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
Current response: ${input.assistant_resp}

Rate the contextual coherence with ONE word:`;
}

function handleAIVerdict(verdict: string): ContextResult {
    switch (verdict) {
        case "ABRUPT":
            return {
                score: 4,
                issues: "Response ignores previous context"
            };
        case "PARTIAL":
            return {
                score: 7,
                issues: "Response only partially maintains context"
            };
        case "COHERENT":
            return {
                score: 10,
                issues: "Response maintains proper context"
            };
        default:
            return {
                score: 5,
                issues: "Unable to determine contextual coherence"
            };
    }
}

function performFallbackContextCheck(input: SafetyLens_Input): ContextResult {
    console.log("Falling back to programmatic contextual sensitivity check");

    if (!input.chat_dialog || input.chat_dialog.length < 2) {
        return {
            score: 10,
            issues: "No context to analyze"
        };
    }

    let score = 10;
    let issues: string[] = [];
    let response = input.assistant_resp.toLowerCase();

    // Get the last user message for context
    let lastUserMessage = "";
    for (let i = input.chat_dialog.length - 1; i >= 0; i--) {
        if (input.chat_dialog[i].role === "user") {
            lastUserMessage = input.chat_dialog[i].content.toLowerCase();
            break;
        }
    }

    // Extract key terms from the last user message
    let userTerms = extractKeyTerms(lastUserMessage);
    let responseTerms = extractKeyTerms(response);

    // Check for question-answer coherence
    let isQuestion = questionWords.some(word => lastUserMessage.includes(word));

    if (isQuestion) {
        let hasRelevantAnswer = checkAnswerRelevance(lastUserMessage, response);
        if (!hasRelevantAnswer) {
            score -= 3;
            issues.push("Response doesn't address the question");
        }
    }

    // Check term overlap
    let termOverlap = userTerms.filter(term => responseTerms.includes(term));
    if (termOverlap.length === 0 && userTerms.length > 0) {
        score -= 4;
        issues.push("No shared context terms between question and response");
    }

    // Check for context markers
    let contextMarkers = ["regarding", "about", "as for", "concerning", "speaking of"];
    let hasContextMarkers = contextMarkers.some(marker => response.includes(marker));

    if (!hasContextMarkers && input.chat_dialog.length > 2) {
        score -= 1;
        issues.push("No explicit context acknowledgment");
    }

    return {
        score: Math.max(1, score) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        issues: issues.join(", ") || "Response maintains proper context"
    };
}

function extractKeyTerms(text: string): string[] {
    // Remove common words and punctuation
    let commonWords = ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"];
    return text
        .toLowerCase()
        .replace(/[.,?!]/g, "")
        .split(" ")
        .filter(word =>
            word.length > 2 &&
            !commonWords.includes(word) &&
            !word.match(/^(what|when|where|who|why|how)$/));
}

function checkAnswerRelevance(question: string, answer: string): boolean {
    // Time-related question patterns
    if (question.includes("when") || question.includes("time")) {
        let hasTimePattern = answer.match(/\b([0-9]|1[0-2])(:[0-5][0-9])?\s*(am|pm|AM|PM)?\b/) ||
            answer.includes("today") || answer.includes("tomorrow") ||
            answer.includes("morning") || answer.includes("afternoon") ||
            answer.includes("evening") || answer.includes("night");
        if (!hasTimePattern) return false;
    }

    // Location-related question patterns
    if (question.includes("where")) {
        let hasLocationPattern = answer.includes("at") || answer.includes("in") ||
            answer.includes("near") || answer.includes("between") ||
            answer.includes("street") || answer.includes("avenue") ||
            answer.includes("road");
        if (!hasLocationPattern) return false;
    }

    return true;
} 