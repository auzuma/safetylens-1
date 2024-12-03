import fs from "fs";
import path from "path";

export function getPrompt(promptName: string) {
    const promptPath = path.join(__dirname, `../../prompts/${promptName}.md`);
    return fs.readFileSync(promptPath, "utf8");
}