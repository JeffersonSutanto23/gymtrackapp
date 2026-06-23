import { FOOD_CATEGORIES } from "@/lib/categories";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export type FoodEstimate = {
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  notes: string;
};

export class AIAnalysisError extends Error {}

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
};

const FOOD_ESTIMATE_FIELDS = [
  "name (short string, name of the dish or food item)",
  `category (string, must be exactly one of: ${FOOD_CATEGORIES.join(", ")})`,
  "servingSize (number, estimated serving size)",
  "servingUnit (string, unit for servingSize, e.g. g, piece, cup)",
  "calories (number)",
  "proteinG (number, grams of protein)",
  "carbsG (number, grams of carbohydrates)",
  "fatG (number, grams of fat)",
  "fiberG (number, grams of fiber)",
  "sugarG (number, grams of sugar)",
  "sodiumMg (number, milligrams of sodium)",
  "notes (string, one sentence on assumptions or confidence)",
].join("\n");

export async function analyzeFoodPhoto(base64Image: string, mediaType: string): Promise<FoodEstimate> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AIAnalysisError("AI photo analysis is not configured (missing GROQ_API_KEY).");
  }

  const model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Estimate the nutrition for the food/meal shown in this photo, for one visible serving. Respond with ONLY a JSON object with exactly these fields:\n${FOOD_ESTIMATE_FIELDS}`,
            },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64Image}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) {
      console.error("Groq API 429:", text);
      throw new AIAnalysisError("AI usage limit reached for now. Wait a minute and try again.");
    }
    throw new AIAnalysisError(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GroqResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new AIAnalysisError("AI did not return a structured estimate.");
  }

  try {
    return JSON.parse(text) as FoodEstimate;
  } catch {
    throw new AIAnalysisError("AI returned an invalid response.");
  }
}
