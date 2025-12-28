import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AnalyzeResponse } from "@/lib/types";

// Mock data for testing without API key
const MOCK_FOODS = [
  { label: "grilled chicken breast", confidence: 0.92, portion_guess: "medium" as const, calories_per_100g: 165 },
  { label: "steamed white rice", confidence: 0.88, portion_guess: "large" as const, calories_per_100g: 130 },
  { label: "steamed broccoli", confidence: 0.85, portion_guess: "small" as const, calories_per_100g: 34 },
  { label: "grilled salmon", confidence: 0.90, portion_guess: "medium" as const, calories_per_100g: 208 },
  { label: "mixed green salad", confidence: 0.87, portion_guess: "medium" as const, calories_per_100g: 20 },
  { label: "scrambled eggs", confidence: 0.91, portion_guess: "medium" as const, calories_per_100g: 147 },
  { label: "whole wheat toast", confidence: 0.89, portion_guess: "small" as const, calories_per_100g: 247 },
  { label: "avocado", confidence: 0.86, portion_guess: "small" as const, calories_per_100g: 160 },
  { label: "banana", confidence: 0.93, portion_guess: "medium" as const, calories_per_100g: 89 },
  { label: "greek yogurt", confidence: 0.88, portion_guess: "medium" as const, calories_per_100g: 59 },
  { label: "pasta with tomato sauce", confidence: 0.84, portion_guess: "large" as const, calories_per_100g: 131 },
  { label: "beef steak", confidence: 0.89, portion_guess: "large" as const, calories_per_100g: 271 },
  { label: "french fries", confidence: 0.91, portion_guess: "medium" as const, calories_per_100g: 312 },
  { label: "caesar salad", confidence: 0.85, portion_guess: "medium" as const, calories_per_100g: 127 },
  { label: "orange juice", confidence: 0.90, portion_guess: "medium" as const, calories_per_100g: 45 },
];

function getMockResponse(): AnalyzeResponse {
  // Return random 2-4 foods
  const count = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...MOCK_FOODS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return {
    foods: selected.map((food) => ({
      ...food,
      // Add slight variation to confidence
      confidence: Math.min(0.99, food.confidence + (Math.random() * 0.1 - 0.05)),
    })),
  };
}

const SYSTEM_PROMPT = `You are a nutrition analysis AI. Analyze the food image and identify all visible food items.

For each food item, provide:
1. label: A clear, specific name for the food (e.g., "grilled chicken breast" not just "chicken")
2. confidence: Your confidence level from 0 to 1
3. portion_guess: Estimate the portion size as "small", "medium", "large", or "unknown"
4. calories_per_100g: The approximate calories per 100 grams for this food item based on your nutritional knowledge

IMPORTANT: You must respond with ONLY valid JSON in this exact format, no other text:
{
  "foods": [
    {
      "label": "food name",
      "confidence": 0.95,
      "portion_guess": "medium",
      "calories_per_100g": 150
    }
  ]
}

Be accurate with calorie estimates - use your training data on nutrition. If you cannot identify a food clearly, still include it with lower confidence.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // Check if we should use mock mode
    const mockMode = process.env.MOCK_MODE === "true" || !process.env.OPENAI_API_KEY;

    if (mockMode) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json(getMockResponse());
    }

    // Real OpenAI API call
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Analyze this meal image and identify all food items with their nutritional information.",
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed: AnalyzeResponse = JSON.parse(content);
    
    // Validate response structure
    if (!parsed.foods || !Array.isArray(parsed.foods)) {
      return NextResponse.json(
        { error: "Invalid response format from OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}

