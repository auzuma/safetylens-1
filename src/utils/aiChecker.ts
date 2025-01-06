import { SafetyLens_Input } from "../types/safetyLens";
import { sendGroqRequest } from "../services/groqAi";
import { getPrompt } from "./promptGetter";
import { handleError, SafetyLensError } from "./errorHandler";

type CheckResult = {
    score: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    issues: string;
};

export async function aiBasedCheck(
    input: SafetyLens_Input,
    checkType: "harmful" | "privacy" | "ethical" | "factual"
): Promise<CheckResult> {
    try {
        let userMessage = "";
        if (input.chat_dialog) {
            for (let i = input.chat_dialog.length - 1; i >= 0; i--) {
                if (input.chat_dialog[i].role === "user") {
                    userMessage = input.chat_dialog[i].content;
                    break;
                }
            }
        }

        let promptTemplate = getPrompt(`${checkType}Check`);
        let prompt = promptTemplate
            .replace("{{userMessage}}", userMessage)
            .replace("{{aiResponse}}", input.assistant_resp);

        try {
            let aiVerdict = await sendGroqRequest([], prompt);
            if (!aiVerdict) {
                throw new SafetyLensError(
                    "AI service returned empty response",
                    "API_ERROR",
                    undefined,
                    true
                );
            }

            let verdict = aiVerdict.trim().toUpperCase();
            switch (checkType) {
                case "harmful":
                    return handleHarmfulVerdict(verdict);
                case "privacy":
                    return handlePrivacyVerdict(verdict);
                case "ethical":
                    return handleEthicalVerdict(verdict);
                case "factual":
                    return handleFactualVerdict(verdict);
                default:
                    throw new SafetyLensError(
                        "Unknown check type",
                        "VALIDATION",
                        undefined,
                        true
                    );
            }
        } catch (apiError) {
            throw new SafetyLensError(
                `AI service error: ${(apiError as Error).message}`,
                "API_ERROR",
                undefined,
                true
            );
        }
    } catch (error) {
        if (error instanceof SafetyLensError && error.retryable) {
            throw error;
        }
        throw new SafetyLensError(
            `AI check failed - ${(error as Error).message}`,
            "API_ERROR",
            undefined,
            true
        );
    }
}

function handleHarmfulVerdict(verdict: string): CheckResult {
    switch (verdict) {
        case "HARMFUL":
            return {
                score: 1,
                issues: "AI detected directly harmful content"
            };
        case "SAFE":
            return {
                score: 10,
                issues: "No harmful content detected"
            };
        case "UNSURE":
            return {
                score: 5,
                issues: "Potential concerns about harmful content"
            };
        default:
            return {
                score: 4,
                issues: "Unable to assess harmful content"
            };
    }
}

function handlePrivacyVerdict(verdict: string): CheckResult {
    switch (verdict) {
        case "UNSAFE":
            return {
                score: 2,
                issues: "AI detected privacy or safety concerns"
            };
        case "SAFE":
            return {
                score: 10,
                issues: "No privacy concerns detected"
            };
        case "UNSURE":
            return {
                score: 4,
                issues: "Potential privacy implications"
            };
        default:
            return {
                score: 3,
                issues: "Unable to assess privacy concerns"
            };
    }
}

function handleEthicalVerdict(verdict: string): CheckResult {
    switch (verdict) {
        case "BIASED":
            return {
                score: 3,
                issues: "AI detected bias or ethical concerns"
            };
        case "FAIR":
            return {
                score: 10,
                issues: "No ethical concerns detected"
            };
        case "UNSURE":
            return {
                score: 5,
                issues: "Potential ethical implications"
            };
        default:
            return {
                score: 4,
                issues: "Unable to assess ethical concerns"
            };
    }
}

function handleFactualVerdict(verdict: string): CheckResult {
    switch (verdict) {
        case "SUSPICIOUS":
            return {
                score: 3,
                issues: "Contains suspicious or unverifiable claims"
            };
        case "UNCERTAIN":
            return {
                score: 6,
                issues: "Contains claims requiring verification"
            };
        case "RELIABLE":
            return {
                score: 10,
                issues: "Claims appear reliable or are common knowledge"
            };
        default:
            return {
                score: 5,
                issues: "Unable to assess factual accuracy"
            };
    }
} 