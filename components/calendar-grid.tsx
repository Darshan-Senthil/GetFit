"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  getDaysInMonth,
  getWorkoutForDateWithOffset,
  getDayName,
  getMonthName,
  isSameDay,
  isCurrentMonth,
  WorkoutDay,
  workoutOptions,
} from "@/lib/weeklyWorkout";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useWorkout } from "@/context/workout-context";

interface CalendarGridProps {
  todayWorkoutIndex?: number;
}

export function CalendarGrid({ todayWorkoutIndex = 0 }: CalendarGridProps) {
  const today = new Date();
  const {
    setWorkoutStatus,
    getWorkoutStatus,
    isWorkoutCompleted,
  } = useWorkout();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [openPopoverDate, setOpenPopoverDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(year, month);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const colorMap: Record<
    string,
    {
      bg: string;
      text: string;
      border: string;
      ring: string;
      ping: string;
      dot: string;
    }
  > = {
    orange: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
      ring: "ring-orange-500",
      ping: "bg-orange-400",
      dot: "bg-orange-500",
    },
    red: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      ring: "ring-red-500",
      ping: "bg-red-400",
      dot: "bg-red-500",
    },
    blue: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      ring: "ring-blue-500",
      ping: "bg-blue-400",
      dot: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-500/20",
      text: "text-purple-400",
      border: "border-purple-500/30",
      ring: "ring-purple-500",
      ping: "bg-purple-400",
      dot: "bg-purple-500",
    },
    cyan: {
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      ring: "ring-cyan-500",
      ping: "bg-cyan-400",
      dot: "bg-cyan-500",
    },
    emerald: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      ring: "ring-emerald-500",
      ping: "bg-emerald-400",
      dot: "bg-emerald-500",
    },
    rose: {
      bg: "bg-rose-500/20",
      text: "text-rose-400",
      border: "border-rose-500/30",
      ring: "ring-rose-500",
      ping: "bg-rose-400",
      dot: "bg-rose-500",
    },
  };

  const getWorkoutColorClasses = (workout: WorkoutDay) => {
    return colorMap[workout.color] || colorMap.emerald;
  };

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {getMonthName(month)} {year}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="border-border hover:bg-muted"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="border-border hover:bg-muted"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
          <div
            key={dayIndex}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {getDayName(dayIndex)}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const isToday = isSameDay(date, today);
          const isInCurrentMonth = isCurrentMonth(date, month);
          const workout = getWorkoutForDateWithOffset(date, todayWorkoutIndex);
          const colors = getWorkoutColorClasses(workout);
          const status = getWorkoutStatus(date);
          const isCompleted = status === "done";
          const isRest = status === "rest";
          const isMissed = status === "missed";
          const isPastOrToday = date <= today;
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const isPopoverOpen = openPopoverDate === dateKey;

          // Determine cell styling based on status
          const getStatusStyles = () => {
            if (isCompleted) {
              return {
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/30",
                text: "text-emerald-400",
                overlay: "bg-emerald-500/5",
              };
            }
            if (isRest) {
              return {
                bg: "bg-blue-500/10",
                border: "border-blue-500/30",
                text: "text-blue-400",
                overlay: "bg-blue-500/5",
              };
            }
            if (isMissed) {
              return {
                bg: "bg-red-500/10",
                border: "border-red-500/30",
                text: "text-red-400",
                overlay: "bg-red-500/5",
              };
            }
            return {
              bg: colors.bg,
              border: colors.border,
              text: colors.text,
              overlay: "",
            };
          };

          const statusStyles = getStatusStyles();

          return (
            <Popover
              key={index}
              open={isPopoverOpen}
              onOpenChange={(open) =>
                setOpenPopoverDate(open ? dateKey : null)
              }
            >
              <PopoverTrigger asChild>
                <div
                  className={cn(
                    "relative min-h-[100px] p-2 rounded-lg border transition-all duration-200 cursor-pointer",
                    isInCurrentMonth
                      ? statusStyles.bg
                      : "bg-muted/10 border-transparent",
                    isInCurrentMonth && statusStyles.border,
                    isToday &&
                      `ring-2 ${colors.ring} ring-offset-2 ring-offset-background`,
                    isInCurrentMonth && "hover:border-amber-500/50 hover:shadow-md"
                  )}
                >
                  {/* Status Overlay */}
                  {(isCompleted || isRest || isMissed) && isInCurrentMonth && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-lg pointer-events-none",
                        statusStyles.overlay
                      )}
                    />
                  )}

                  {/* Date Number */}
                  <div
                    className={cn(
                      "text-sm font-semibold mb-1",
                      isCompleted && isInCurrentMonth
                        ? "text-emerald-400"
                        : isRest && isInCurrentMonth
                        ? "text-blue-400"
                        : isMissed && isInCurrentMonth
                        ? "text-red-400"
                        : isToday
                        ? colors.text
                        : isInCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {date.getDate()}
                  </div>

                  {/* Workout Info */}
                  {isInCurrentMonth && (
                    <div
                      className={cn(
                        "rounded-md p-1.5 border",
                        statusStyles.bg,
                        statusStyles.border
                      )}
                    >
                      <div
                        className={cn(
                          "text-[10px] font-medium leading-tight",
                          statusStyles.text,
                          isCompleted && "line-through"
                        )}
                      >
                        {workout.name}
                      </div>
                    </div>
                  )}

                  {/* Status Indicator Badge */}
                  {isInCurrentMonth && (isCompleted || isRest || isMissed) && (
                    <div className="absolute bottom-1.5 right-1.5">
                      {isCompleted && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center">
                          <CheckIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {isRest && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-blue-500 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">R</span>
                        </div>
                      )}
                      {isMissed && (
                        <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-500 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold">X</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Today indicator */}
                  {isToday && !isCompleted && !isRest && !isMissed && (
                    <div className="absolute top-1 right-1">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            colors.ping
                          )}
                        ></span>
                        <span
                          className={cn(
                            "relative inline-flex rounded-full h-2 w-2",
                            colors.dot
                          )}
                        ></span>
                      </span>
                    </div>
                  )}

                  {/* Status badge for today */}
                  {isToday && (isCompleted || isRest || isMissed) && (
                    <div className="absolute top-1 right-1">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            isCompleted
                              ? "bg-emerald-400"
                              : isRest
                              ? "bg-blue-400"
                              : "bg-red-400"
                          )}
                        ></span>
                        <span
                          className={cn(
                            "relative inline-flex rounded-full h-2 w-2",
                            isCompleted
                              ? "bg-emerald-500"
                              : isRest
                              ? "bg-blue-500"
                              : "bg-red-500"
                          )}
                        ></span>
                      </span>
                    </div>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-56 p-2 bg-card border-border"
                align="start"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                    Mark workout status
                  </p>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setWorkoutStatus(date, "done");
                      setOpenPopoverDate(null);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Completed</span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isRest
                        ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setWorkoutStatus(date, "rest");
                      setOpenPopoverDate(null);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Rest Day</span>
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isMissed
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      setWorkoutStatus(date, "missed");
                      setOpenPopoverDate(null);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Missed Workout</span>
                    </div>
                  </Button>
                  {(isCompleted || isRest || isMissed) && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        setWorkoutStatus(date, null);
                        setOpenPopoverDate(null);
                      }}
                    >
                      <span>Clear status</span>
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>

      {/* Legend - Shows the 7-day sequence starting from today's selection */}
      <div className="mt-8 p-4 rounded-lg bg-card/50 border border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          7-Day Workout Cycle
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
            const workoutIndex =
              (todayWorkoutIndex + dayOffset) % workoutOptions.length;
            const workout = workoutOptions[workoutIndex];
            const colors = getWorkoutColorClasses(workout);
            return (
              <div
                key={dayOffset}
                className={cn(
                  "p-2 rounded-lg border text-center",
                  colors.bg,
                  colors.border,
                  dayOffset === 0 && "ring-2 ring-amber-500/50"
                )}
              >
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  {dayOffset === 0 ? "Today" : `Day ${dayOffset + 1}`}
                </div>
                <div className={cn("text-xs font-medium", colors.text)}>
                  {workout.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
