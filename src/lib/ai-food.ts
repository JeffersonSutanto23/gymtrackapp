import { FOOD_CATEGORIES } from "@/lib/categories";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.0-flash";

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

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function analyzeFoodPhoto(base64Image: string, mediaType: string): Promise<FoodEstimate> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AIAnalysisError("AI photo analysis is not configured (missing GEMINI_API_KEY).");
  }

  const model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const res = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { inline_data: { mime_type: mediaType, data: base64Image } },
            {
              text: "Estimate the nutrition for the food/meal shown in this photo, for one visible serving.",
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING", description: "Short name of the dish or food item" },
            category: { type: "STRING", enum: [...FOOD_CATEGORIES] },
            servingSize: { type: "NUMBER", description: "Estimated serving size as a number" },
            servingUnit: { type: "STRING", description: "Unit for servingSize, e.g. g, piece, cup" },
            calories: { type: "NUMBER" },
            proteinG: { type: "NUMBER" },
            carbsG: { type: "NUMBER" },
            fatG: { type: "NUMBER" },
            fiberG: { type: "NUMBER" },
            sugarG: { type: "NUMBER" },
            sodiumMg: { type: "NUMBER" },
            notes: { type: "STRING", description: "One sentence on assumptions or confidence" },
          },
          required: [
            "name",
            "category",
            "servingSize",
            "servingUnit",
            "calories",
            "proteinG",
            "carbsG",
            "fatG",
            "fiberG",
            "sugarG",
            "sodiumMg",
            "notes",
          ],
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) {
      console.error("Gemini API 429:", text);
      throw new AIAnalysisError("AI usage limit reached for now. Wait a minute and try again.");
    }
    throw new AIAnalysisError(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new AIAnalysisError("AI did not return a structured estimate.");
  }

  try {
    return JSON.parse(text) as FoodEstimate;
  } catch {
    throw new AIAnalysisError("AI returned an invalid response.");
  }
}
