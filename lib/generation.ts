export type FileMap = Record<string, string>; // path -> file contents

export const SYSTEM_PROMPT = `You are an expert full-stack engineer generating a complete, working Next.js 14 + TypeScript + Tailwind project from a plain-English description.

RULES:
- Respond with ONLY a single JSON object, no markdown fences, no commentary before or after.
- The JSON object's keys are file paths (e.g. "app/page.tsx", "package.json") and values are the complete file contents as strings.
- Always include a valid package.json with "next", "react", "react-dom" as dependencies and a "dev" script.
- Always include app/layout.tsx and app/page.tsx (Next.js App Router).
- Always include tailwind.config.ts, postcss.config.js, and app/globals.css with @tailwind directives.
- Write real, working, idiomatic code — no placeholders like "// TODO" or "rest of code here".
- Keep the project to a reasonable size (typically 5-15 files) unless the request clearly needs more.
- Do not include node_modules, .next, or any build output.`;

export function buildUserPrompt(description: string, existingFiles?: FileMap): string {
  if (existingFiles && Object.keys(existingFiles).length > 0) {
    return `Here is the CURRENT project (path -> contents):\n${JSON.stringify(existingFiles)}\n\nApply this change and return the FULL updated project as JSON (same format, only modify what's needed, keep everything else intact):\n${description}`;
  }
  return `Generate a complete Next.js project for this app idea:\n${description}`;
}

// Parses the model's JSON response into a FileMap. Throws a descriptive error
// if the model didn't follow the format (which happens occasionally with any LLM).
export function parseGeneratedFiles(raw: string): FileMap {
  let cleaned = raw.trim();
  // Strip markdown fences defensively, in case the model adds them anyway.
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?\n?/, "").replace(/```$/, "").trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI response wasn't valid JSON. Try regenerating.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("The AI response wasn't a valid file map.");
  }

  const files: FileMap = {};
  for (const [path, content] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof content === "string") {
      files[path] = content;
    }
  }

  if (Object.keys(files).length === 0) {
    throw new Error("The AI response contained no files.");
  }

  return files;
}
