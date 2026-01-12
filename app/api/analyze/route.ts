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

const SYSTEM_PROMPT = `You are an expert nutrition analysis AI specialized in identifying foods from images with high accuracy. Your task is to analyze meal images and extract detailed nutritional information.

CRITICAL INSTRUCTIONS:
1. Examine the ENTIRE image carefully, including background items, side dishes, and partially visible foods
2. Identify ALL food items present, even if they're partially obscured, in poor lighting, or at unusual angles
3. Use context clues (serving dishes, utensils, typical meal combinations) to help identify foods
4. For ambiguous items, make educated guesses based on visual characteristics and typical cuisine patterns
5. If multiple portions of the same food exist, list them as separate entries or estimate total quantity

FOOD IDENTIFICATION GUIDELINES:
- Be specific: Use descriptive names (e.g., "chicken biryani", "boiled egg", "cucumber raita" not just "rice", "egg", "yogurt")
- Include cooking method when visible (grilled, fried, steamed, raw, etc.)
- Note dish names for prepared meals (e.g., "butter chicken", "pad thai", "caesar salad")
- For mixed dishes, list main components separately when distinguishable
- Include common accompaniments (sauces, dips, garnishes) as separate items when visible

PORTION SIZE ESTIMATION:
- "small": Appetizer-sized, condiment portions, single pieces (e.g., 1 egg, small side salad, 1/4 cup serving)
- "medium": Standard single serving, typical meal portion (e.g., 1 chicken breast, 1 cup rice, standard bowl)
- "large": Multiple servings, oversized portions, family-style servings (e.g., 2+ chicken pieces, large plate, >1.5 cups)

CALORIE ESTIMATION:
- Use standard nutritional databases for accurate calorie values per 100g
- Account for cooking methods (fried foods have more calories than grilled)
- For prepared dishes, estimate based on main ingredients and typical preparation
- Be realistic: Common foods range from 20-600 calories per 100g depending on type and preparation

CONFIDENCE SCORING:
- 0.9-1.0: Very clear, unmistakable identification
- 0.7-0.89: Likely correct, some uncertainty about specifics
- 0.5-0.69: Probable guess based on visual cues
- Below 0.5: Include only if reasonably confident it's a food item

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON in this exact format, no markdown, no additional text:
{
  "foods": [
    {
      "label": "specific food name with details",
      "confidence": 0.95,
      "portion_guess": "medium",
      "calories_per_100g": 220
    }
  ]
}

IMPORTANT: Always return a valid JSON object with a "foods" array, even if you can only identify one item. If uncertain about any detail, make your best estimate rather than omitting the food.`;

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
              text: `Analyze this meal image thoroughly. Examine all visible foods, including:
- Main dishes and entrees
- Side dishes and accompaniments  
- Sauces, dips, and condiments
- Beverages (if applicable)
- Any partially visible or background items

For each food item identified, provide:
1. A specific, descriptive label (include cooking method and dish name if applicable)
2. Your confidence level (0-1)
3. Portion size estimate (small/medium/large)
4. Accurate calories per 100g based on standard nutritional data

Look carefully at the entire image - check corners, backgrounds, and edges for any foods that might be partially visible. Even if something is unclear, make your best educated guess based on visual characteristics, colors, textures, and typical meal patterns.`,
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
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

