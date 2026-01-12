import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface UserInfo {
  // Section 1: Personal Profile
  age: string;
  height: string;
  weight: string;
  gender: string;
  bodyFat?: string;
  medicalConditions?: string;
  
  // Section 2: Fitness Background & Preferences
  fitnessExperience: string;
  workoutAccess: string;
  workoutTime: string;
  trainingType: string;
  muscleGroupsFocus?: string;
  muscleGroupsAvoid?: string;
  daysPerWeek: string;
  mobilityConcerns?: string;
  
  // Section 3: Nutrition Preferences & Goals
  goalType: string;
  dietaryPreference: string;
  mealFrequency: string;
  allergies?: string;
  cookingSkill: string;
  budgetRange?: string;
  preferredCuisine?: string;
  kitchenAccess: string;
  
  // Section 4: Optional Enhancements
  sleepHours?: string;
  stressLevel?: string;
  supplements?: string;
  trackCalories: string;
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

    // Initialize OpenAI client lazily (only when needed, not at module level)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Build comprehensive user profile summary
    const userProfile = `
Personal Profile:
- Age: ${userInfo.age} years old
- Gender: ${userInfo.gender}
- Height: ${userInfo.height}
- Weight: ${userInfo.weight}
${userInfo.bodyFat ? `- Body Fat: ${userInfo.bodyFat}%` : ""}
${userInfo.medicalConditions ? `- Medical Conditions/Injuries: ${userInfo.medicalConditions}` : ""}

Fitness Background:
- Experience Level: ${userInfo.fitnessExperience}
- Workout Access: ${userInfo.workoutAccess}
- Time Available: ${userInfo.workoutTime} minutes per session
- Training Type Preference: ${userInfo.trainingType}
- Days per Week: ${userInfo.daysPerWeek}
${userInfo.muscleGroupsFocus ? `- Focus Areas: ${userInfo.muscleGroupsFocus}` : ""}
${userInfo.muscleGroupsAvoid ? `- Avoid Areas: ${userInfo.muscleGroupsAvoid}` : ""}
${userInfo.mobilityConcerns ? `- Mobility Concerns: ${userInfo.mobilityConcerns}` : ""}

Nutrition & Goals:
- Goal: ${userInfo.goalType}
- Dietary Preference: ${userInfo.dietaryPreference}
- Meal Frequency: ${userInfo.mealFrequency}
- Cooking Skill: ${userInfo.cookingSkill}
- Kitchen Access: ${userInfo.kitchenAccess}
- Track Calories: ${userInfo.trackCalories}
${userInfo.preferredCuisine ? `- Preferred Cuisine: ${userInfo.preferredCuisine}` : ""}
${userInfo.budgetRange ? `- Budget Range: ${userInfo.budgetRange}` : ""}
${userInfo.allergies ? `- Allergies/Restrictions: ${userInfo.allergies}` : ""}

Additional Context:
${userInfo.sleepHours ? `- Sleep: ${userInfo.sleepHours}` : ""}
${userInfo.stressLevel ? `- Stress Level: ${userInfo.stressLevel}` : ""}
${userInfo.supplements ? `- Supplements: ${userInfo.supplements}` : ""}
`.trim();

    // Build the prompt for workout plan
    const workoutPrompt = `Generate a comprehensive 7-day personalized workout plan based on the following user profile:

${userProfile}

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
- Create exactly ${userInfo.daysPerWeek} workout days per week (distribute rest days appropriately)
- Each day should target different muscle groups with proper recovery time
- Include 4-6 exercises per day based on available time (${userInfo.workoutTime} minutes)
- Provide sets x reps format for each exercise
- Include YouTube video links for exercises when possible
- Adapt exercises based on workout access: ${userInfo.workoutAccess}
- Respect training type preference: ${userInfo.trainingType}
- Match experience level: ${userInfo.fitnessExperience}
${userInfo.muscleGroupsFocus ? `- Emphasize these muscle groups: ${userInfo.muscleGroupsFocus}` : ""}
${userInfo.muscleGroupsAvoid ? `- Avoid these muscle groups: ${userInfo.muscleGroupsAvoid}` : ""}
${userInfo.mobilityConcerns ? `- Address mobility concerns: ${userInfo.mobilityConcerns}` : ""}
${userInfo.medicalConditions ? `- IMPORTANT: Avoid exercises that could worsen: ${userInfo.medicalConditions}` : ""}
- Do not repeat the same workout within 2 days
- Focus on variety, progression, and proper form
- Return ONLY valid JSON, no markdown formatting`;

    // Build the prompt for meal plan
    const mealPrompt = `Generate a comprehensive 7-day personalized meal plan based on the following user profile:

${userProfile}

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
- Structure meals according to meal frequency: ${userInfo.mealFrequency}
- Calculate total daily calories based on goal: ${userInfo.goalType}
- Age: ${userInfo.age}, Gender: ${userInfo.gender}, Height: ${userInfo.height}, Weight: ${userInfo.weight}
- Strictly respect dietary preference: ${userInfo.dietaryPreference}
${userInfo.allergies ? `- CRITICAL: Avoid these allergens/restrictions: ${userInfo.allergies}` : ""}
- Match cooking skill level: ${userInfo.cookingSkill}
- Consider kitchen access: ${userInfo.kitchenAccess}
${userInfo.preferredCuisine ? `- Incorporate preferred cuisine styles: ${userInfo.preferredCuisine}` : ""}
${userInfo.budgetRange ? `- Consider budget constraints: ${userInfo.budgetRange}` : ""}
${userInfo.medicalConditions ? `- Consider medical conditions for dietary restrictions: ${userInfo.medicalConditions}` : ""}
${userInfo.sleepHours ? `- Consider sleep pattern: ${userInfo.sleepHours}` : ""}
${userInfo.stressLevel ? `- Consider stress level for recovery: ${userInfo.stressLevel}` : ""}
${userInfo.supplements ? `- Note existing supplements to avoid overlap: ${userInfo.supplements}` : ""}
- Include meal name, detailed ingredients with quantities, calories per meal, and cooking/prep method
- Ensure nutritional balance (protein, carbs, fats)
- Provide variety across the week to prevent boredom
- ${userInfo.trackCalories === "track" ? "Include detailed calorie counts for each meal" : "Focus on intuitive portion guidance"}
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
