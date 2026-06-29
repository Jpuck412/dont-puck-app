import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "./db";
import { decrypt } from "./crypto";

export type Provider = "anthropic" | "openai" | "gemini";

const SHARED_DAILY_CAP = 5; // generations per user per day on the shared key

export class UsageCapError extends Error {
  constructor() {
    super(`Daily free generation limit (${SHARED_DAILY_CAP}) reached. Add your own API key in Settings for unlimited use.`);
    this.name = "UsageCapError";
  }
}

export class NoKeyAvailableError extends Error {
  constructor() {
    super("No API key available for this provider.");
    this.name = "NoKeyAvailableError";
  }
}

interface ResolvedKey {
  key: string;
  isShared: boolean;
}

// Looks up a user's own BYOK key for a provider; returns null if they haven't set one.
async function getUserKey(userId: number, provider: Provider): Promise<string | null> {
  const result = await sql`
    SELECT encrypted_key FROM api_keys
    WHERE user_id = ${userId} AND provider = ${provider}
    LIMIT 1
  `;
  if (result.rows.length === 0) return null;
  return decrypt(result.rows[0].encrypted_key as string);
}

// Checks and increments today's shared-key usage atomically. Throws UsageCapError if over cap.
async function checkAndIncrementSharedUsage(userId: number): Promise<void> {
  const result = await sql`
    INSERT INTO shared_key_usage (user_id, usage_date, generation_count)
    VALUES (${userId}, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET generation_count = shared_key_usage.generation_count + 1
    WHERE shared_key_usage.generation_count < ${SHARED_DAILY_CAP}
    RETURNING generation_count
  `;
  if (result.rows.length === 0) {
    // The WHERE clause blocked the update, meaning the cap was already hit.
    throw new UsageCapError();
  }
}

// Resolves which key to actually use for this generation call: BYOK first, shared fallback second.
async function resolveKey(userId: number, provider: Provider): Promise<ResolvedKey> {
  const userKey = await getUserKey(userId, provider);
  if (userKey) {
    return { key: userKey, isShared: false };
  }

  if (provider !== "anthropic") {
    // Shared fallback is only offered for Anthropic (the site owner's own key).
    // BYOK is required for OpenAI/Gemini in v1.
    throw new NoKeyAvailableError();
  }

  const sharedKey = process.env.ANTHROPIC_API_KEY;
  if (!sharedKey) {
    throw new NoKeyAvailableError();
  }

  await checkAndIncrementSharedUsage(userId);
  return { key: sharedKey, isShared: true };
}

export interface GenerateOptions {
  userId: number;
  provider: Provider;
  systemPrompt: string;
  userPrompt: string;
}

export interface GenerateResult {
  text: string;
  usedSharedKey: boolean;
}

export async function generate(opts: GenerateOptions): Promise<GenerateResult> {
  const { userId, provider, systemPrompt, userPrompt } = opts;
  const { key, isShared } = await resolveKey(userId, provider);

  if (provider === "anthropic") {
    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return { text: textBlock?.type === "text" ? textBlock.text : "", usedSharedKey: isShared };
  }

  if (provider === "openai") {
    const client = new OpenAI({ apiKey: key });
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    return { text: response.choices[0]?.message?.content || "", usedSharedKey: isShared };
  }

  // gemini
  const client = new GoogleGenerativeAI(key);
  const model = client.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContent([systemPrompt, userPrompt].join("\n\n"));
  return { text: result.response.text(), usedSharedKey: isShared };
}

export { SHARED_DAILY_CAP };
