import Groq from "groq-sdk";
import { logger } from "../utils/logger";
import { rateLimiter } from "./rateLimiter";
import { handleError, SafetyLensError } from "../utils/errorHandler";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
}

let groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function sendGroqRequest(
    messages: any[] | [] = [],
    systemPrompt: string | null = null,
    model: string | null = "llama-3.1-70b-versatile"
) {
    let requestId = `groq_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return rateLimiter.executeRequest(async () => {
        try {
            let completion = await groq.chat.completions.create({
                messages: [
                    systemPrompt ? {
                        role: "system",
                        content: systemPrompt
                    } : {},
                    ...messages
                ],
                model: model as string,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false
            });

            if (!completion.choices?.[0]?.message?.content) {
                throw new SafetyLensError(
                    "Empty response from Groq API",
                    "API_ERROR",
                    requestId,
                    true
                );
            }

            return completion.choices[0].message.content;
        } catch (error: any) {
            throw handleError(error, `Groq API request ${requestId}`);
        }
    }, requestId);
}
