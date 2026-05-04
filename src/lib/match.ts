import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MODEL = "claude-sonnet-4-6";

interface RFPInput {
  title: string;
  focusAreas: string[];
  geographies: string[];
  description: string;
}

interface NonprofitInput {
  orgName: string;
  mission: string;
  focusAreas: string[];
  serviceAreas: string[];
}

export interface MatchResult {
  score: number;
  justification: string;
}

export async function computeMatchScore(
  rfp: RFPInput,
  nonprofit: NonprofitInput
): Promise<MatchResult> {
  const userPrompt =
    `RFP: ${rfp.title}. Focus areas: ${rfp.focusAreas.join(", ")}. ` +
    `Geography: ${rfp.geographies.join(", ")}. Description: ${rfp.description}. ` +
    `--- Nonprofit: ${nonprofit.orgName}. Mission: ${nonprofit.mission}. ` +
    `Focus areas: ${nonprofit.focusAreas.join(", ")}. Service areas: ${nonprofit.serviceAreas.join(", ")}.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 150,
    system:
      "You are a grant-matching analyst. Given an RFP and a nonprofit profile, return a JSON object with two fields: score (integer 0-100) and justification (one sentence, max 20 words, explaining the primary reason for the score). Return only valid JSON, no markdown, no preamble.",
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "{}";
  const parsed = JSON.parse(text) as { score: unknown; justification: unknown };

  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score)))),
    justification: String(parsed.justification ?? "No justification available."),
  };
}
