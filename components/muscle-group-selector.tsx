"use client";

import { cn } from "@/lib/utils";

// Muscle groups with MuscleWiki API IDs
const muscleGroups = [
  { id: "chest", label: "Chest", muscleId: 2, icon: ChestIcon },
  { id: "back", label: "Back", muscleId: 7, icon: BackIcon },
  { id: "shoulders", label: "Shoulders", muscleId: 6, icon: ShouldersIcon },
  { id: "biceps", label: "Biceps", muscleId: 1, icon: BicepsIcon },
  { id: "triceps", label: "Triceps", muscleId: 5, icon: TricepsIcon },
  { id: "legs", label: "Legs", muscleId: 3, icon: LegsIcon },
  { id: "glutes", label: "Glutes", muscleId: 9, icon: GlutesIcon },
  { id: "abs", label: "Core", muscleId: 12, icon: AbsIcon },
] as const;

export type MuscleGroup = (typeof muscleGroups)[number];
export type MuscleGroupId = MuscleGroup["id"];

interface MuscleGroupSelectorProps {
  selected: MuscleGroup | null;
  onSelect: (group: MuscleGroup) => void;
}

function ChestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a2 2 0 012 2v2a2 2 0 01-4 0V4a2 2 0 012-2zm-3 8h6v10a2 2 0 01-2 2h-2a2 2 0 01-2-2V10zm8-2a1 1 0 011 1v6a1 1 0 01-2 0V9a1 1 0 011-1zM7 8a1 1 0 011 1v6a1 1 0 01-2 0V9a1 1 0 011-1z" />
    </svg>
  );
}

function ShouldersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4a2 2 0 100 4 2 2 0 000-4zM4 10c0-1 1-2 2-2h12c1 0 2 1 2 2v2c0 1-1 2-2 2h-1v6h-2v-6h-2v6h-2v-6H9v6H7v-6H6c-1 0-2-1-2-2v-2z" />
    </svg>
  );
}

function BicepsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
    </svg>
  );
}

function TricepsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 6.5h-2a1 1 0 00-1 1v9a1 1 0 001 1h2m0-11v11m0-11a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1m-11-11h2a1 1 0 011 1v9a1 1 0 01-1 1h-2m0-11v11m0-11a1 1 0 00-1-1h-2a1 1 0 00-1 1v11a1 1 0 001 1h2a1 1 0 001-1m5.5-5.5h-3" />
    </svg>
  );
}

function LegsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 2v7.5L8.5 22h-2l2-10H7l-2 10H3l3.5-14V2h4.5zm2 0h4.5v6l3.5 14h-2l-2-10h-1.5l2 10h-2L13 9.5V2z" />
    </svg>
  );
}

function GlutesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function AbsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v4H6V4zm8 0h4v4h-4V4zM6 10h4v4H6v-4zm8 0h4v4h-4v-4zM6 16h4v4H6v-4zm8 0h4v4h-4v-4z" />
    </svg>
  );
}

export function MuscleGroupSelector({
  selected,
  onSelect,
}: MuscleGroupSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {muscleGroups.map((group) => {
          const isSelected = selected?.id === group.id;
          const Icon = group.icon;

          return (
            <button
              key={group.id}
              onClick={() => onSelect(group)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                "border outline-none focus-visible:ring-2 focus-visible:ring-red-500/50",
                isSelected
                  ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10"
                  : "bg-card/50 border-border hover:border-red-500/30 text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  isSelected && "scale-110"
                )}
              />
              <span>{group.label}</span>

              {/* Active indicator dot */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
