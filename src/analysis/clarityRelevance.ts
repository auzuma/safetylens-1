import { SafetyLens_Input } from "../types/safetyLens";

export function checkClarityRelevance(input: SafetyLens_Input) {
    let score = 10;
    let issues = [];

    let response = input.assistant_resp;

    if (response.length < 10) {
        score -= 3;
        issues.push("Response too short");
    }

    if (input.chat_dialog?.length && input.chat_dialog[0].role === "user") {
        let userQuestion = input.chat_dialog[0].content.toLowerCase();
        let responseText = response.toLowerCase();

        if (!responseText.includes(userQuestion.split(" ")[0])) {
            score -= 2;
            issues.push("Response may not directly address the question");
        }
    }

    return {
        score: Math.max(1, score) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        issues: issues.join(", ") || "Response is clear and relevant"
    };
}
