import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

export async function embedText(text: string): Promise<number[]> {
  try {
    const result = await genAI.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 384,
        taskType: "RETRIEVAL_QUERY",
      },
    });

    const values = result.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      console.error("Empty embedding returned for text:", text.slice(0, 100));
      throw new Error("Empty embedding");
    }
    return values;
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
}

export async function searchLennyChunks(
  queryText: string,
  matchCount: number = 10
) {
  const { query: dbQuery } = await import("./db");
  const embedding = await embedText(queryText);
  const embeddingStr = `[${embedding.join(",")}]`;

  const result = await dbQuery(
    `SELECT id, chunk_id, content, guest, title, timestamp_start,
            1 - (embedding <=> $1::vector) as similarity
     FROM lenny_chunks
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [embeddingStr, matchCount]
  );

  return result.rows;
}
