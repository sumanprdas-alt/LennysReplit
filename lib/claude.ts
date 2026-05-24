import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

export async function callClaudeJSON(system: string, user: string, maxTokens: number = 2048) {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  
  // Try to parse JSON, with fallback for truncated responses
  try {
    // Remove markdown code fences if present
    const clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    // Try to fix truncated JSON by closing open structures
    try {
      let fixed = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      // Count open braces/brackets and close them
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      
      // Remove trailing comma if present
      fixed = fixed.replace(/,\s*$/, "");
      // Remove incomplete string
      if (fixed.match(/"[^"]*$/)) {
        fixed = fixed.replace(/"[^"]*$/, '""');
      }
      
      // Close open structures
      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
      for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";
      
      return JSON.parse(fixed);
    } catch {
      throw new Error(`${(e as Error).message}`);
    }
  }
}
