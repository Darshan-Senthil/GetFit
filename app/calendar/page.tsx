"use client";

import { CalendarGrid } from "@/components/calendar-grid";
import {
  getFullDayName,
  workoutOptions,
  WorkoutDay,
} from "@/lib/weeklyWorkout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWorkout } from "@/context/workout-context";

export default function CalendarPage() {
  const today = new Date();
  const dayName = getFullDayName(today.getDay());

  // Use global workout context
  const { todayWorkoutIndex, setTodayWorkoutIndex, todayWorkout } =
    useWorkout();

  const colorMap: Record<
    string,
    { bg: string; text: string; border: string; dot: string; selectBg: string }
  > = {
    orange: {
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
      dot: "bg-orange-500",
      selectBg: "bg-orange-500/20 data-[highlighted]:bg-orange-500/30",
    },
    red: {
      bg: "bg-red-500/20",
      text: "text-red-400",
      border: "border-red-500/30",
      dot: "bg-red-500",
      selectBg: "bg-red-500/20 data-[highlighted]:bg-red-500/30",
    },
    blue: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      dot: "bg-blue-500",
      selectBg: "bg-blue-500/20 data-[highlighted]:bg-blue-500/30",
    },
    purple: {
      bg: "bg-purple-500/20",
      text: "text-purple-400",
      border: "border-purple-500/30",
      dot: "bg-purple-500",
      selectBg: "bg-purple-500/20 data-[highlighted]:bg-purple-500/30",
    },
    cyan: {
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      dot: "bg-cyan-500",
      selectBg: "bg-cyan-500/20 data-[highlighted]:bg-cyan-500/30",
    },
    emerald: {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      dot: "bg-emerald-500",
      selectBg: "bg-emerald-500/20 data-[highlighted]:bg-emerald-500/30",
    },
    rose: {
      bg: "bg-rose-500/20",
      text: "text-rose-400",
      border: "border-rose-500/30",
      dot: "bg-rose-500",
      selectBg: "bg-rose-500/20 data-[highlighted]:bg-rose-500/30",
    },
  };

  const getWorkoutColorClasses = (workout: WorkoutDay) => {
    return colorMap[workout.color] || colorMap.emerald;
  };

  const colors = getWorkoutColorClasses(todayWorkout);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient - amber/gold theme for calendar */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/50 via-background to-orange-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-sm text-amber-400 font-medium">
                Training Schedule
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Weekly Calendar</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Plan your workouts and stay consistent with your fitness journey.
            </p>

            {/* Today's Workout Card with Dropdown */}
            <div className="inline-flex flex-col items-center p-6 rounded-2xl bg-card/50 border border-border backdrop-blur-sm">
              <span className="text-sm text-muted-foreground mb-3">
                Today is {dayName}
              </span>

              {/* Workout Selector Dropdown */}
              <div className="mb-4 w-full max-w-xs">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Select today&apos;s workout to shift the schedule
                </label>
                <Select
                  value={todayWorkoutIndex.toString()}
                  onValueChange={(value) =>
                    setTodayWorkoutIndex(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-full bg-background/50 border-amber-500/30 focus:ring-amber-500/50">
                    <SelectValue placeholder="Select workout" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {workoutOptions.map((workout, index) => {
                      const itemColors =
                        colorMap[workout.color] || colorMap.emerald;
                      return (
                        <SelectItem
                          key={index}
                          value={index.toString()}
                          className={`${itemColors.selectBg} focus:${itemColors.bg} my-1 rounded-md`}
                        >
                          <span className={itemColors.text}>
                            {workout.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Selection Display */}
              <div
                className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${colors.bg} ${colors.border}`}
              >
                <div className="text-left">
                  <span className={`text-lg font-bold ${colors.text}`}>
                    {todayWorkout.name}
                  </span>
                  {todayWorkout.isRest && (
                    <p className="text-xs text-muted-foreground">
                      Recovery day - focus on stretching!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid - pass the offset */}
          <CalendarGrid todayWorkoutIndex={todayWorkoutIndex} />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Stay consistent, stay strong</p>
        </div>
      </footer>
    </main>
  );
}
