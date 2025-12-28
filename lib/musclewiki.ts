// MuscleWiki API types and utilities

export interface MuscleWikiExercise {
  id: number;
  name: string;
  muscles_primary: Array<{ id: number; name: string }>;
  muscles_secondary: Array<{ id: number; name: string }>;
  category: { id: number; name: string } | null;
  difficulty: { id: number; name: string } | null;
  male_images: Array<{
    og_image: string;
    unbranded_video: string;
    branded_video: string;
  }>;
  female_images: Array<{
    og_image: string;
    unbranded_video: string;
    branded_video: string;
  }>;
  correct_steps: Array<{ order: number; text: string }> | null;
}

// Exercise type for frontend use
export interface Exercise {
  id: number;
  name: string;
  target: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  instructions: string[];
}

export interface MuscleWikiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MuscleWikiExercise[];
}

// Muscle ID mapping for MuscleWiki API
export const MUSCLE_IDS: Record<string, number> = {
  chest: 2,
  back: 7, // Lats
  shoulders: 6,
  biceps: 1,
  triceps: 5,
  legs: 3, // Quads
  glutes: 9,
  hamstrings: 8,
  calves: 11,
  abs: 12, // Abdominals
  traps: 4,
  forearms: 10,
  "lower back": 13,
};

// Display names for UI
export const MUSCLE_GROUPS = [
  { id: "chest", label: "Chest", muscleId: 2 },
  { id: "back", label: "Back", muscleId: 7 },
  { id: "shoulders", label: "Shoulders", muscleId: 6 },
  { id: "biceps", label: "Biceps", muscleId: 1 },
  { id: "triceps", label: "Triceps", muscleId: 5 },
  { id: "legs", label: "Legs", muscleId: 3 },
  { id: "glutes", label: "Glutes", muscleId: 9 },
  { id: "abs", label: "Core", muscleId: 12 },
] as const;

export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]["id"];
