import express, { Request, Response } from "express";
import { evaluateSafety } from "./app.js";
import { SafetyLens_Input } from "./types/safetyLens";
import { logger } from "./utils/logger.js";
import cors from "cors";

let app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main safety check endpoint
app.post("/api/safety-check", async (req: any, res: any) => {
    try {
        let input: SafetyLens_Input = req.body;

        // Basic validation
        if (!input.assistant_resp) {
            return res.status(400).json({
                error: "Missing required field: assistant_resp"
            });
        }

        // Run safety evaluation
        let result = await evaluateSafety(input);
        res.json(result);

    } catch (error) {
        logger.error(`Error processing safety check: ${error}`);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
});

// Batch safety check endpoint
app.post("/api/safety-check/batch", async (req: any, res: any) => {
    try {
        let inputs: SafetyLens_Input[] = req.body;

        if (!Array.isArray(inputs)) {
            return res.status(400).json({
                error: "Request body must be an array of safety check inputs"
            });
        }

        // Process all inputs in parallel
        let results = await Promise.all(
            inputs.map(async (input) => {
                try {
                    return await evaluateSafety(input);
                } catch (error) {
                    return {
                        error: error instanceof Error ? error.message : "Unknown error",
                        input
                    };
                }
            })
        );

        res.json(results);

    } catch (error) {
        logger.error(`Error processing batch safety check: ${error}`);
        res.status(500).json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error occurred"
        });
    }
});

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.success(`SafetyLens API server running on port ${PORT}`);
}); 