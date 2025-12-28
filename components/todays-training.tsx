"use client";

import { MuscleTarget, getFullDayName } from "@/lib/weeklyWorkout";
import { cn } from "@/lib/utils";
import { useWorkout } from "@/context/workout-context";

interface TodaysTrainingProps {
  onSelectMuscle: (muscle: MuscleTarget) => void;
  selectedMuscleId?: number | null;
  accentColor: "red" | "cyan"; // red for workouts, cyan for stretches
}

export function TodaysTraining({
  onSelectMuscle,
  selectedMuscleId,
  accentColor,
}: TodaysTrainingProps) {
  const today = new Date();
  const { todayWorkout } = useWorkout();
  const dayName = getFullDayName(today.getDay());

  // Filter out cardio for stretches page (muscleId 0 is cardio placeholder)
  const availableMuscles =
    accentColor === "cyan"
      ? todayWorkout.muscles.filter((m) => m.muscleId !== 0)
      : todayWorkout.muscles.filter((m) => m.muscleId !== 0); // Also filter cardio from workouts as it has no exercises

  const colorClasses = {
    red: {
      containerBorder: "border-red-500/40",
      containerBg:
        "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent",
      containerShadow: "shadow-lg shadow-red-500/5",
      containerGlow: "ring-1 ring-red-500/20",
      headerText: "text-red-400",
      pillBg: "bg-red-500/15",
      pillBorder: "border-red-500/30",
      pillHoverBg: "hover:bg-red-500/25",
      pillHoverBorder: "hover:border-red-500/60",
      pillSelectedBg: "bg-red-500/30",
      pillSelectedBorder: "border-red-500",
      pillSelectedText: "text-red-300",
      pillSelectedShadow: "shadow-md shadow-red-500/20",
      text: "text-red-400",
      ring: "focus-visible:ring-red-500/50",
      iconBg: "bg-red-500/20",
    },
    cyan: {
      containerBorder: "border-cyan-500/40",
      containerBg:
        "bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-transparent",
      containerShadow: "shadow-lg shadow-cyan-500/5",
      containerGlow: "ring-1 ring-cyan-500/20",
      headerText: "text-cyan-400",
      pillBg: "bg-cyan-500/15",
      pillBorder: "border-cyan-500/30",
      pillHoverBg: "hover:bg-cyan-500/25",
      pillHoverBorder: "hover:border-cyan-500/60",
      pillSelectedBg: "bg-cyan-500/30",
      pillSelectedBorder: "border-cyan-500",
      pillSelectedText: "text-cyan-300",
      pillSelectedShadow: "shadow-md shadow-cyan-500/20",
      text: "text-cyan-400",
      ring: "focus-visible:ring-cyan-500/50",
      iconBg: "bg-cyan-500/20",
    },
  };

  const colors = colorClasses[accentColor];

  // Rest day or no muscles scheduled
  if (todayWorkout.isRest || availableMuscles.length === 0) {
    return (
      <div className="w-full mt-10">
        <div
          className={cn(
            "relative p-6 rounded-2xl border backdrop-blur-sm",
            colors.containerBorder,
            colors.containerBg,
            colors.containerShadow,
            colors.containerGlow
          )}
        >
          <div className="flex items-center justify-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                colors.iconBg
              )}
            >
              <RestIcon className={cn("w-6 h-6", colors.text)} />
            </div>
            <div className="text-left">
              <h3 className={cn("text-lg font-bold", colors.headerText)}>
                Today&apos;s Training
              </h3>
              <p className="text-sm text-muted-foreground">
                {todayWorkout.isRest
                  ? "Rest day — Focus on recovery!"
                  : "No training scheduled for today"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-10">
      <div
        className={cn(
          "relative p-6 rounded-2xl border backdrop-blur-sm",
          colors.containerBorder,
          colors.containerBg,
          colors.containerShadow,
          colors.containerGlow
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                colors.iconBg
              )}
            >
              <CalendarIcon className={cn("w-5 h-5", colors.text)} />
            </div>
            <div>
              <h3 className={cn("text-lg font-bold", colors.headerText)}>
                Today&apos;s Training
              </h3>
              <p className="text-xs text-muted-foreground">
                {dayName} — {todayWorkout.name}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  accentColor === "red" ? "bg-red-400" : "bg-cyan-400"
                )}
              ></span>
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2 w-2",
                  accentColor === "red" ? "bg-red-500" : "bg-cyan-500"
                )}
              ></span>
            </span>
            <span>Click to load</span>
          </div>
        </div>

        {/* Muscle Pills */}
        <div className="flex flex-wrap gap-3">
          {availableMuscles.map((muscle) => {
            const isSelected = selectedMuscleId === muscle.muscleId;
            return (
              <button
                key={muscle.id}
                onClick={() => onSelectMuscle(muscle)}
                className={cn(
                  "relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300",
                  "border-2 outline-none focus-visible:ring-2",
                  colors.ring,
                  isSelected
                    ? cn(
                        colors.pillSelectedBg,
                        colors.pillSelectedBorder,
                        colors.pillSelectedText,
                        colors.pillSelectedShadow,
                        "scale-105"
                      )
                    : cn(
                        colors.pillBg,
                        colors.pillBorder,
                        "text-foreground",
                        colors.pillHoverBg,
                        colors.pillHoverBorder,
                        "hover:scale-105"
                      )
                )}
              >
                {muscle.label}
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        accentColor === "red" ? "bg-red-400" : "bg-cyan-400"
                      )}
                    ></span>
                    <span
                      className={cn(
                        "relative inline-flex rounded-full h-3 w-3",
                        accentColor === "red" ? "bg-red-500" : "bg-cyan-500"
                      )}
                    ></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function RestIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}
