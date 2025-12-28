import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserInfo {
  gender: string;
  age: string;
  height: string;
  weight: string;
  activityLevel: string;
  dietPreference: string;
  goal: string;
  workoutAccess: string;
  timePerDay: string;
}

export async function POST(request: NextRequest) {
  try {
    const userInfo: UserInfo = await request.json();

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt for workout plan
    const workoutPrompt = `Generate a 7-day personalized workout plan for a ${userInfo.age}-year-old ${userInfo.gender}, ${userInfo.height} height, ${userInfo.weight} weight, goal is ${userInfo.goal}, prefers ${userInfo.dietPreference} food, has ${userInfo.workoutAccess} access, and can work out for ${userInfo.timePerDay} minutes daily.

Output format as JSON object with this exact structure:
{
  "Monday": {
    "focus": "Chest + Triceps",
    "exercises": [
      {
        "name": "Incline Bench Press",
        "sets": "4 x 12",
        "reps": "12",
        "video": "https://youtube.com/watch?v=xyz"
      }
    ]
  },
  "Tuesday": {
    "focus": "Back + Biceps",
    "exercises": [
      {
        "name": "Pull-ups",
        "sets": "4 x 10",
        "reps": "10",
        "video": "https://youtube.com/watch?v=abc"
      }
    ]
  },
  "Wednesday": { ... },
  "Thursday": { ... },
  "Friday": { ... },
  "Saturday": { ... },
  "Sunday": { ... }
}

Requirements:
- Each day should target different muscle groups
- Include 4-6 exercises per day
- Provide sets x reps format
- Include YouTube video links for exercises when possible
- Do not repeat the same workout within 2 days
- Focus on variety and progression
- Adapt exercises based on workout access (${userInfo.workoutAccess})
- Respect time constraint (${userInfo.timePerDay} minutes)
- Return ONLY valid JSON, no markdown formatting`;

    // Build the prompt for meal plan
    const mealPrompt = `Generate a 7-day personalized meal plan (3 meals + 1 snack per day) for a ${userInfo.age}-year-old ${userInfo.gender}, ${userInfo.height} height, ${userInfo.weight} weight, goal is ${userInfo.goal}, prefers ${userInfo.dietPreference} food, activity level is ${userInfo.activityLevel}.

Output format as JSON object with this exact structure:
{
  "Monday": {
    "breakfast": {
      "name": "Oats + Eggs",
      "ingredients": [
        { "item": "Rolled Oats", "qty": "1/2 cup" },
        { "item": "Eggs", "qty": "3 boiled" }
      ],
      "calories": 420,
      "prep": "Boil oats in milk, boil eggs separately"
    },
    "lunch": {
      "name": "Grilled Chicken Salad",
      "ingredients": [
        { "item": "Chicken Breast", "qty": "150g" },
        { "item": "Mixed Greens", "qty": "100g" }
      ],
      "calories": 350,
      "prep": "Grill chicken, mix with greens"
    },
    "dinner": {
      "name": "Salmon with Vegetables",
      "ingredients": [
        { "item": "Salmon", "qty": "200g" },
        { "item": "Broccoli", "qty": "150g" }
      ],
      "calories": 450,
      "prep": "Bake salmon, steam vegetables"
    },
    "snack": {
      "name": "Greek Yogurt with Berries",
      "ingredients": [
        { "item": "Greek Yogurt", "qty": "150g" },
        { "item": "Mixed Berries", "qty": "100g" }
      ],
      "calories": 180,
      "prep": "Mix yogurt with fresh berries"
    },
    "totalCalories": 2000
  },
  "Tuesday": { ... },
  "Wednesday": { ... },
  "Thursday": { ... },
  "Friday": { ... },
  "Saturday": { ... },
  "Sunday": { ... }
}

Requirements:
- Include meal name, ingredients with quantities, calories per meal, and cooking/prep method
- Calculate total daily calories based on goal (${userInfo.goal})
- Respect diet preference: ${userInfo.dietPreference}
- Ensure nutritional balance
- Provide variety across the week
- Return ONLY valid JSON, no markdown formatting`;

    // Generate workout plan
    const workoutResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a certified fitness and nutrition expert who provides personalized weekly workout and meal plans. Always respond with valid JSON only, no markdown formatting, no code blocks.",
        },
        {
          role: "user",
          content: workoutPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Generate meal plan
    const mealResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a certified fitness and nutrition expert who provides personalized weekly workout and meal plans. Always respond with valid JSON only, no markdown formatting, no code blocks.",
        },
        {
          role: "user",
          content: mealPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse responses
    let workoutPlan;
    let mealPlan;

    try {
      const workoutContent = workoutResponse.choices[0]?.message?.content;
      if (!workoutContent) {
        throw new Error("No workout plan generated");
      }
      
      // Handle both JSON object format and direct object
      const workoutParsed = JSON.parse(workoutContent);
      // If OpenAI returns { "workoutPlan": {...} }, extract it
      workoutPlan = workoutParsed.workoutPlan || workoutParsed;

      const mealContent = mealResponse.choices[0]?.message?.content;
      if (!mealContent) {
        throw new Error("No meal plan generated");
      }
      
      // Handle both JSON object format and direct object
      const mealParsed = JSON.parse(mealContent);
      // If OpenAI returns { "mealPlan": {...} }, extract it
      mealPlan = mealParsed.mealPlan || mealParsed;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Workout content:", workoutResponse.choices[0]?.message?.content);
      console.error("Meal content:", mealResponse.choices[0]?.message?.content);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: String(parseError) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workoutPlan,
      mealPlan,
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}

