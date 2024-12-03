import fs from "fs";
import path from "path";
import process from "process";

export function getPrompt(promptName: string) {
    let rootDir = process.cwd();
    let promptPath = path.join(rootDir, `prompts/${promptName}.md`);
    return fs.readFileSync(promptPath, "utf8");
}