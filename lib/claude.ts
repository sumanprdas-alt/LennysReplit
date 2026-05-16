import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

export async function callClaudeJSON(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1024
): Promise<any> {
  const text = await callClaude(
    systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no backticks, no preamble.",
    userMessage,
    maxTokens
  );

  // Strip markdown fences if present
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}
