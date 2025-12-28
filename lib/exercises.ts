// ExerciseDB API types and fetch utilities

export interface Exercise {
  id: string;
  name: string;
  gifUrl: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

// Body parts available in the ExerciseDB API
export const BODY_PARTS = [
  "chest",
  "back", 
  "shoulders",
  "upper arms",
  "lower arms",
  "upper legs",
  "lower legs",
  "waist",
  "cardio",
  "neck",
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

// Fetch exercises by body part
export async function getExercisesByBodyPart(bodyPart: string): Promise<Exercise[]> {
  const res = await fetch(
    `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=50`,
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch exercises: ${res.status}`);
  }

  return res.json();
}

// Fetch all available body parts (for reference)
export async function getBodyParts(): Promise<string[]> {
  const res = await fetch(
    "https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com",
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch body parts: ${res.status}`);
  }

  return res.json();
}

