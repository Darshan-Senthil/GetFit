"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { workoutOptions, WorkoutDay } from "@/lib/weeklyWorkout";

// Helper to format date as YYYY-MM-DD for storage keys
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

// Weight entry type
export interface WeightEntry {
  weight: number;
  unit: "kg" | "lbs";
}

// Progress photo type
export interface ProgressPhoto {
  id: string;
  dataUrl: string;
  date: string;
  note?: string;
}

// Daily note type
export interface DailyNote {
  note: string;
  mood?: "great" | "good" | "okay" | "tired" | "sore";
}

// Workout status type for heatmap
export type WorkoutStatus = "done" | "rest" | "missed" | null;

interface WorkoutContextType {
  todayWorkoutIndex: number;
  setTodayWorkoutIndex: (index: number) => void;
  todayWorkout: WorkoutDay;
  completedWorkouts: Record<string, boolean>;
  toggleWorkoutCompletion: (date: Date) => void;
  isWorkoutCompleted: (date: Date) => boolean;
  // Workout status (for heatmap)
  workoutStatuses: Record<string, WorkoutStatus>;
  setWorkoutStatus: (date: Date, status: WorkoutStatus) => void;
  getWorkoutStatus: (date: Date) => WorkoutStatus;
  // Weight tracking
  weightEntries: Record<string, WeightEntry>;
  setWeight: (date: Date, weight: number, unit: "kg" | "lbs") => void;
  getWeight: (date: Date) => WeightEntry | undefined;
  // Progress photos
  progressPhotos: ProgressPhoto[];
  addProgressPhoto: (dataUrl: string, date: Date, note?: string) => void;
  deleteProgressPhoto: (id: string) => void;
  // Daily notes
  dailyNotes: Record<string, DailyNote>;
  setDailyNote: (date: Date, note: string, mood?: DailyNote["mood"]) => void;
  getDailyNote: (date: Date) => DailyNote | undefined;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const STORAGE_KEY = "getfit-today-workout-index";
const COMPLETED_STORAGE_KEY = "getfit-completed-workouts";
const WORKOUT_STATUS_STORAGE_KEY = "getfit-workout-statuses";
const WEIGHT_STORAGE_KEY = "getfit-weight-entries";
const PHOTOS_STORAGE_KEY = "getfit-progress-photos";
const NOTES_STORAGE_KEY = "getfit-daily-notes";

export function WorkoutProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise default to 0
  const [todayWorkoutIndex, setTodayWorkoutIndexState] = useState<number>(0);
  const [completedWorkouts, setCompletedWorkouts] = useState<
    Record<string, boolean>
  >({});
  const [workoutStatuses, setWorkoutStatuses] = useState<
    Record<string, WorkoutStatus>
  >({});
  const [weightEntries, setWeightEntries] = useState<
    Record<string, WeightEntry>
  >({});
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [dailyNotes, setDailyNotes] = useState<Record<string, DailyNote>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < workoutOptions.length) {
        setTodayWorkoutIndexState(parsed);
      }
    }

    const completedStored = localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (completedStored !== null) {
      try {
        setCompletedWorkouts(JSON.parse(completedStored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    const statusStored = localStorage.getItem(WORKOUT_STATUS_STORAGE_KEY);
    if (statusStored !== null) {
      try {
        setWorkoutStatuses(JSON.parse(statusStored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    const weightStored = localStorage.getItem(WEIGHT_STORAGE_KEY);
    if (weightStored !== null) {
      try {
        setWeightEntries(JSON.parse(weightStored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    const photosStored = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (photosStored !== null) {
      try {
        setProgressPhotos(JSON.parse(photosStored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    const notesStored = localStorage.getItem(NOTES_STORAGE_KEY);
    if (notesStored !== null) {
      try {
        setDailyNotes(JSON.parse(notesStored));
      } catch {
        // Invalid JSON, ignore
      }
    }

    setIsHydrated(true);
  }, []);

  // Persist to localStorage when changed
  const setTodayWorkoutIndex = (index: number) => {
    setTodayWorkoutIndexState(index);
    localStorage.setItem(STORAGE_KEY, index.toString());
  };

  // Toggle workout completion for a specific date
  const toggleWorkoutCompletion = (date: Date) => {
    const dateKey = formatDateKey(date);
    setCompletedWorkouts((prev) => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        delete updated[dateKey];
      } else {
        updated[dateKey] = true;
      }
      localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Check if a workout is completed for a specific date
  const isWorkoutCompleted = (date: Date): boolean => {
    const dateKey = formatDateKey(date);
    return !!completedWorkouts[dateKey];
  };

  // Workout status for heatmap
  const setWorkoutStatus = (date: Date, status: WorkoutStatus) => {
    const dateKey = formatDateKey(date);
    setWorkoutStatuses((prev) => {
      const updated = { ...prev };
      if (status === null) {
        delete updated[dateKey];
      } else {
        updated[dateKey] = status;
      }
      localStorage.setItem(WORKOUT_STATUS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    // Also sync with completedWorkouts for calendar compatibility
    if (status === "done") {
      setCompletedWorkouts((prev) => {
        const updated = { ...prev, [dateKey]: true };
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } else {
      setCompletedWorkouts((prev) => {
        const updated = { ...prev };
        delete updated[dateKey];
        localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const getWorkoutStatus = (date: Date): WorkoutStatus => {
    const dateKey = formatDateKey(date);
    return workoutStatuses[dateKey] || null;
  };

  // Weight tracking
  const setWeight = (date: Date, weight: number, unit: "kg" | "lbs") => {
    const dateKey = formatDateKey(date);
    setWeightEntries((prev) => {
      const updated = { ...prev, [dateKey]: { weight, unit } };
      localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getWeight = (date: Date): WeightEntry | undefined => {
    const dateKey = formatDateKey(date);
    return weightEntries[dateKey];
  };

  // Progress photos
  const addProgressPhoto = (dataUrl: string, date: Date, note?: string) => {
    const newPhoto: ProgressPhoto = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      date: formatDateKey(date),
      note,
    };
    setProgressPhotos((prev) => {
      const updated = [newPhoto, ...prev];
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProgressPhoto = (id: string) => {
    setProgressPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Daily notes
  const setDailyNote = (date: Date, note: string, mood?: DailyNote["mood"]) => {
    const dateKey = formatDateKey(date);
    setDailyNotes((prev) => {
      const updated = { ...prev, [dateKey]: { note, mood } };
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getDailyNote = (date: Date): DailyNote | undefined => {
    const dateKey = formatDateKey(date);
    return dailyNotes[dateKey];
  };

  const todayWorkout = workoutOptions[todayWorkoutIndex];

  // Don't render children until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <WorkoutContext.Provider
      value={{
        todayWorkoutIndex,
        setTodayWorkoutIndex,
        todayWorkout,
        completedWorkouts,
        toggleWorkoutCompletion,
        isWorkoutCompleted,
        workoutStatuses,
        setWorkoutStatus,
        getWorkoutStatus,
        weightEntries,
        setWeight,
        getWeight,
        progressPhotos,
        addProgressPhoto,
        deleteProgressPhoto,
        dailyNotes,
        setDailyNote,
        getDailyNote,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
