// Weekly workout schedule utility

export interface MuscleTarget {
  id: string;
  label: string;
  muscleId: number;
}

export interface WorkoutDay {
  name: string;
  color: string; // Tailwind color class
  isRest: boolean;
  muscles: MuscleTarget[]; // Muscle groups for this day
}

// Muscle group definitions (matching MuscleWiki API IDs)
export const muscleDefinitions: Record<string, MuscleTarget> = {
  chest: { id: "chest", label: "Chest", muscleId: 2 },
  back: { id: "back", label: "Back", muscleId: 7 },
  shoulders: { id: "shoulders", label: "Shoulders", muscleId: 6 },
  biceps: { id: "biceps", label: "Biceps", muscleId: 1 },
  triceps: { id: "triceps", label: "Triceps", muscleId: 5 },
  legs: { id: "legs", label: "Legs", muscleId: 3 },
  glutes: { id: "glutes", label: "Glutes", muscleId: 9 },
  abs: { id: "abs", label: "Core", muscleId: 12 },
  cardio: { id: "cardio", label: "Cardio", muscleId: 0 }, // Special case - no specific muscle
  core: { id: "abs", label: "Core", muscleId: 12 }, // Core maps to abs
};

// All available workout options
export const workoutOptions: WorkoutDay[] = [
  {
    name: "Chest + Shoulders",
    color: "red",
    isRest: false,
    muscles: [muscleDefinitions.chest, muscleDefinitions.shoulders],
  },
  {
    name: "Back + Biceps",
    color: "blue",
    isRest: false,
    muscles: [muscleDefinitions.back, muscleDefinitions.biceps],
  },
  {
    name: "Legs",
    color: "purple",
    isRest: false,
    muscles: [muscleDefinitions.legs, muscleDefinitions.glutes],
  },
  {
    name: "Rest + Stretching",
    color: "cyan",
    isRest: true,
    muscles: [],
  },
  {
    name: "Back + Core",
    color: "emerald",
    isRest: false,
    muscles: [muscleDefinitions.back, muscleDefinitions.core],
  },
  {
    name: "Cardio",
    color: "rose",
    isRest: false,
    muscles: [muscleDefinitions.cardio],
  },
  {
    name: "Cardio + Core",
    color: "orange",
    isRest: false,
    muscles: [muscleDefinitions.cardio, muscleDefinitions.abs],
  },
];

// Default workout sequence (indices into workoutOptions)
// Day 1: Chest + Shoulders, Day 2: Back + Biceps, Day 3: Legs, etc.
export const defaultWorkoutSequence = [0, 1, 2, 3, 4, 5, 6];

// Get workout for a date with optional offset
// todayOffset: which workout index to use for "today" (shifts the entire schedule)
export const getWorkoutForDateWithOffset = (
  date: Date,
  todayOffset: number = 0
): WorkoutDay => {
  // Normalize both dates to midnight to get accurate day difference
  const today = new Date();
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const dateNormalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // Calculate days difference (positive = future, negative = past)
  const daysDiff = Math.round(
    (dateNormalized.getTime() - todayNormalized.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Calculate which workout in the sequence
  // todayOffset is the index in workoutOptions for today (daysDiff = 0)
  // Then we add daysDiff to get the workout for the target date
  const workoutIndex =
    (((todayOffset + daysDiff) % workoutOptions.length) +
      workoutOptions.length) %
    workoutOptions.length;

  return workoutOptions[workoutIndex];
};

// Legacy function for backward compatibility (uses default schedule based on day of week)
export const getWorkoutForDate = (date: Date): WorkoutDay => {
  const dayOfWeek = date.getDay();
  // Map day of week to workout options
  const dayToWorkoutMap: Record<number, number> = {
    0: 6, // Sunday -> Cardio + Core
    1: 0, // Monday -> Chest + Shoulders
    2: 1, // Tuesday -> Back + Biceps
    3: 2, // Wednesday -> Legs
    4: 3, // Thursday -> Rest + Stretching
    5: 4, // Friday -> Back + Core
    6: 5, // Saturday -> Cardio
  };
  return workoutOptions[dayToWorkoutMap[dayOfWeek]];
};

export const getDayName = (dayIndex: number): string => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayIndex];
};

export const getFullDayName = (dayIndex: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex];
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
};

// Get all days in a month for calendar grid
export const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add padding days from previous month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add padding days from next month to complete the grid
  const endPadding = 42 - days.length; // 6 rows * 7 days = 42
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

// Check if two dates are the same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Check if date is in current month
export const isCurrentMonth = (date: Date, currentMonth: number): boolean => {
  return date.getMonth() === currentMonth;
};
