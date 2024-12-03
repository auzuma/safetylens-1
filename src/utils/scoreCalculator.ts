import { config } from "../config";

export function calculateWeightedScore(scores: {
    harmful: number;
    privacy: number;
    ethical: number;
    clarity: number;
}) {
    let weightedTotal =
        scores.harmful * config.weights.harmful +
        scores.privacy * config.weights.privacy +
        scores.ethical * config.weights.ethical +
        scores.clarity * config.weights.clarity;

    let totalWeight =
        config.weights.harmful +
        config.weights.privacy +
        config.weights.ethical +
        config.weights.clarity;

    return Math.round(weightedTotal / totalWeight) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
}

export function hasCriticalViolation(scores: {
    harmful: number;
    privacy: number;
    ethical: number;
    clarity: number;
}) {
    return (
        scores.harmful <= config.threshold.criticalViolationScore ||
        scores.privacy <= config.threshold.privacyViolationScore ||
        scores.harmful <= config.threshold.harmfulContentScore
    );
}
