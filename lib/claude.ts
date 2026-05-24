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
  
  try {
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    // Fix truncated JSON
    try {
      let fixed = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      fixed = fixed.replace(/,\s*$/, "");
      // Fix incomplete string at end
      const lastQuote = fixed.lastIndexOf('"');
      const afterLast = fixed.slice(lastQuote + 1);
      if (afterLast.match(/^[^"]*$/) && !afterLast.match(/[}\]]/)) {
        fixed = fixed.slice(0, lastQuote + 1);
      }
      // Close open structures
      const ob = (fixed.match(/{/g) || []).length - (fixed.match(/}/g) || []).length;
      const oq = (fixed.match(/\[/g) || []).length - (fixed.match(/\]/g) || []).length;
      fixed = fixed.replace(/,\s*$/, "");
      for (let i = 0; i < oq; i++) fixed += "]";
      for (let i = 0; i < ob; i++) fixed += "}";
      return JSON.parse(fixed);
    } catch {
      throw new Error(`${(e as Error).message}`);
    }
  }
}
