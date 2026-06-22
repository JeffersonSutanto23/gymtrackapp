import { FOOD_CATEGORIES } from "@/lib/categories";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-4-6";

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

type AnthropicTextBlock = { type: "text"; text: string };
type AnthropicToolUseBlock = { type: "tool_use"; id: string; name: string; input: unknown };
type AnthropicMessageResponse = {
  content: (AnthropicTextBlock | AnthropicToolUseBlock)[];
};

export async function analyzeFoodPhoto(base64Image: string, mediaType: string): Promise<FoodEstimate> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIAnalysisError("AI photo analysis is not configured (missing ANTHROPIC_API_KEY).");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
      max_tokens: 1024,
      tools: [
        {
          name: "report_nutrition_estimate",
          description: "Report a best-effort nutrition estimate for the food shown in the photo.",
          input_schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Short name of the dish or food item" },
              category: { type: "string", enum: [...FOOD_CATEGORIES] },
              servingSize: { type: "number", description: "Estimated serving size as a number" },
              servingUnit: { type: "string", description: "Unit for servingSize, e.g. g, piece, cup" },
              calories: { type: "number" },
              proteinG: { type: "number" },
              carbsG: { type: "number" },
              fatG: { type: "number" },
              fiberG: { type: "number" },
              sugarG: { type: "number" },
              sodiumMg: { type: "number" },
              notes: { type: "string", description: "One sentence on assumptions or confidence" },
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
      ],
      tool_choice: { type: "tool", name: "report_nutrition_estimate" },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Image } },
            {
              type: "text",
              text: "Estimate the nutrition for the food/meal shown in this photo, for one visible serving.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AIAnalysisError(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as AnthropicMessageResponse;
  const toolUse = data.content.find((block): block is AnthropicToolUseBlock => block.type === "tool_use");
  if (!toolUse) {
    throw new AIAnalysisError("AI did not return a structured estimate.");
  }

  return toolUse.input as FoodEstimate;
}
