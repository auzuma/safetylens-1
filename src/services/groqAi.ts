import Groq from "groq-sdk";
import { logger } from "../utils/logger";
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

        return completion.choices[0]?.message?.content || null;
    } catch (error) {
        logger.error(`Error in Groq API request: ${error}`);
        return null;
    }
}
