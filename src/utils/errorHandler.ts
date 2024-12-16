import { logger } from "./logger";

export type ErrorType =
    | "RATE_LIMIT"
    | "API_ERROR"
    | "TIMEOUT"
    | "VALIDATION"
    | "UNKNOWN";

export class SafetyLensError extends Error {
    type: ErrorType;
    requestId?: string;
    retryable: boolean;

    constructor(message: string, type: ErrorType, requestId?: string, retryable = false) {
        super(message);
        this.name = "SafetyLensError";
        this.type = type;
        this.requestId = requestId;
        this.retryable = retryable;
    }
}

export function handleError(error: any, context: string): SafetyLensError {
    if (error instanceof SafetyLensError) {
        return error;
    }

    let message = error?.message || "Unknown error occurred";
    let type: ErrorType = "UNKNOWN";
    let retryable = false;

    if (message.includes("rate_limit_exceeded")) {
        type = "RATE_LIMIT";
        retryable = true;
    } else if (message.includes("timeout")) {
        type = "TIMEOUT";
        retryable = true;
    } else if (message.includes("validation")) {
        type = "VALIDATION";
        retryable = false;
    } else if (message.includes("api")) {
        type = "API_ERROR";
        retryable = true;
    }

    logger.error(`${context}: ${message}`);
    return new SafetyLensError(message, type, undefined, retryable);
}

export function isRetryableError(error: any): boolean {
    if (error instanceof SafetyLensError) {
        return error.retryable;
    }
    return error?.message?.includes("rate_limit_exceeded") ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("api");
} 