import { config } from "../config";

export function calculateWeightedScore(scores: {
    harmful: number;
    privacy: number;
    ethical: number;
    clarity: number;
    context: number;
}) {
    // If any critical scores, return the lowest score
    if (scores.harmful <= 3 || scores.privacy <= 3) {
        return Math.min(scores.harmful, scores.privacy) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    }

    // Calculate weighted average
    let weightedTotal =
        scores.harmful * config.weights.harmful +
        scores.privacy * config.weights.privacy +
        scores.ethical * config.weights.ethical +
        scores.clarity * config.weights.clarity +
        scores.context * config.weights.context;

    let totalWeight =
        config.weights.harmful +
        config.weights.privacy +
        config.weights.ethical +
        config.weights.clarity +
        config.weights.context;

    // Round to nearest whole number and ensure it's within valid range
    let finalScore = Math.max(1, Math.min(10, Math.round(weightedTotal / totalWeight)));

    // If ethical concerns exist (score <= 5), cap the maximum at 6
    if (scores.ethical <= 5) {
        finalScore = Math.min(finalScore, 6);
    }

    // If clarity issues exist (score <= 4), cap the maximum at 7
    if (scores.clarity <= 4) {
        finalScore = Math.min(finalScore, 7);
    }

    if (scores.context <= 4) {
        finalScore = Math.min(finalScore, 6);
    }

    return finalScore as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export function hasCriticalViolation(scores: {
    harmful: number;
    privacy: number;
    ethical: number;
    clarity: number;
    context: number;
}) {
    return scores.harmful <= 3 || scores.privacy <= 3;
}
