import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function callClaude(system: string, user: string, maxTokens: number = 512): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function callClaudeJSON(system: string, user: string, maxTokens: number = 2048) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  
  // Extract JSON object — find the first { and its matching }
  const firstBrace = text.indexOf("{");
  if (firstBrace === -1) throw new Error("No JSON found in response");
  
  let depth = 0;
  let lastBrace = -1;
  for (let i = firstBrace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") { depth--; if (depth === 0) { lastBrace = i; break; } }
  }
  
  if (lastBrace === -1) {
    // JSON was truncated — try to close it
    let partial = text.slice(firstBrace);
    partial = partial.replace(/,\s*$/, "");
    // Close open strings
    const quotes = (partial.match(/"/g) || []).length;
    if (quotes % 2 !== 0) partial += '"';
    // Close open structures
    const ob = (partial.match(/{/g) || []).length - (partial.match(/}/g) || []).length;
    const oq = (partial.match(/\[/g) || []).length - (partial.match(/\]/g) || []).length;
    partial = partial.replace(/,\s*$/, "");
    for (let i = 0; i < oq; i++) partial += "]";
    for (let i = 0; i < ob; i++) partial += "}";
    return JSON.parse(partial);
  }
  
  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
}
