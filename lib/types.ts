// Food item as returned by OpenAI API
export interface FoodItem {
  id: string;
  label: string;
  confidence: number;
  portion_guess: "small" | "medium" | "large" | "unknown";
  calories_per_100g: number;
  grams: number;
}

// API response from OpenAI
export interface AnalyzeResponse {
  foods: Array<{
    label: string;
    confidence: number;
    portion_guess: "small" | "medium" | "large" | "unknown";
    calories_per_100g: number;
  }>;
}

// Request body for /api/analyze
export interface AnalyzeRequest {
  image: string; // base64 encoded image
}

// Portion size to grams mapping
export const PORTION_GRAMS: Record<FoodItem["portion_guess"], number> = {
  small: 100,
  medium: 150,
  large: 250,
  unknown: 150,
};

// Helper to calculate calories for a food item
export function calculateCalories(item: FoodItem): number {
  return Math.round((item.grams / 100) * item.calories_per_100g);
}

// Helper to generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

