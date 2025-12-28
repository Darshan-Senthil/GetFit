"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useWorkout,
  formatDateKey,
  DailyNote,
} from "@/context/workout-context";
import { getWorkoutForDateWithOffset } from "@/lib/weeklyWorkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Upload, X } from "lucide-react";

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Get last 30 days as Date objects
function getLast30Days(): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    days.push(date);
  }
  return days;
}

// Get muscle groups from a workout
function getMuscleGroupsFromWorkout(workoutName: string): string[] {
  const mapping: Record<string, string[]> = {
    "Chest + Shoulders": ["Chest", "Shoulders"],
    "Back + Biceps": ["Back", "Biceps"],
    Legs: ["Legs"],
    "Rest + Stretching": [],
    "Back + Core": ["Back", "Core"],
    Cardio: ["Cardio"],
    "Cardio + Core": ["Cardio", "Core"],
  };
  return mapping[workoutName] || [];
}

// Muscle group colors
const muscleColors: Record<string, { bg: string; fill: string; text: string }> =
  {
    Back: {
      bg: "bg-violet-500",
      fill: "from-violet-500 to-violet-600",
      text: "text-violet-400",
    },
    Core: {
      bg: "bg-amber-500",
      fill: "from-amber-500 to-amber-600",
      text: "text-amber-400",
    },
    Cardio: {
      bg: "bg-rose-500",
      fill: "from-rose-500 to-rose-600",
      text: "text-rose-400",
    },
    Chest: {
      bg: "bg-pink-500",
      fill: "from-pink-500 to-pink-600",
      text: "text-pink-400",
    },
    Shoulders: {
      bg: "bg-cyan-500",
      fill: "from-cyan-500 to-cyan-600",
      text: "text-cyan-400",
    },
    Biceps: {
      bg: "bg-blue-500",
      fill: "from-blue-500 to-blue-600",
      text: "text-blue-400",
    },
    Legs: {
      bg: "bg-purple-500",
      fill: "from-purple-500 to-purple-600",
      text: "text-purple-400",
    },
  };

export default function ProgressPage() {
  const {
    todayWorkoutIndex,
    weightEntries,
    setWeight,
    progressPhotos,
    addProgressPhoto,
    deleteProgressPhoto,
    setDailyNote,
    getDailyNote,
    completedWorkouts,
    getWorkoutStatus,
  } = useWorkout();

  const [weightInput, setWeightInput] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [noteInput, setNoteInput] = useState("");
  const [moodInput, setMoodInput] = useState<DailyNote["mood"]>("good");
  const [photoNote, setPhotoNote] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const last30Days = useMemo(() => getLast30Days(), []);

  // Calculate workout consistency stats
  const consistencyStats = useMemo(() => {
    let doneCount = 0;
    let scheduledCount = 0;

    last30Days.forEach((date) => {
      const workout = getWorkoutForDateWithOffset(date, todayWorkoutIndex);
      const status = getWorkoutStatus(date);

      if (status === "done") {
        doneCount++;
      }

      if (!workout.isRest) {
        scheduledCount++;
      }
    });

    const percentage =
      scheduledCount > 0 ? Math.round((doneCount / scheduledCount) * 100) : 0;

    return { doneCount, scheduledCount, percentage };
  }, [completedWorkouts, todayWorkoutIndex, last30Days, getWorkoutStatus]);

  // Calculate muscle group frequency
  const muscleFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};

    last30Days.forEach((date) => {
      const status = getWorkoutStatus(date);
      if (status === "done") {
        const workout = getWorkoutForDateWithOffset(date, todayWorkoutIndex);
        const muscles = getMuscleGroupsFromWorkout(workout.name);
        muscles.forEach((muscle) => {
          frequency[muscle] = (frequency[muscle] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    const maxCount = entries.length > 0 ? entries[0][1] : 1;

    return entries.map(([name, count]) => ({
      name,
      count,
      percentage: (count / maxCount) * 100,
      colors: muscleColors[name] || muscleColors.Back,
    }));
  }, [completedWorkouts, todayWorkoutIndex, last30Days, getWorkoutStatus]);

  // Get weight data for chart
  const weightData = useMemo(() => {
    return last30Days
      .map((date) => {
        const dateKey = formatDateKey(date);
        const entry = weightEntries[dateKey];
        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: date,
          weight: entry?.weight || null,
          unit: entry?.unit || "kg",
        };
      })
      .filter((d) => d.weight !== null);
  }, [weightEntries, last30Days]);

  // Handle weight submission
  const handleWeightSubmit = () => {
    const weight = parseFloat(weightInput);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const selectedDateStart = new Date(selectedDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    if (isNaN(weight) || weight <= 0) {
      toast.error("Invalid weight", {
        description: "Please enter a valid number",
      });
      return;
    }

    if (selectedDateStart > todayStart) {
      toast.error("Invalid date", {
        description: "Cannot log weight for future dates",
      });
      return;
    }

    setWeight(selectedDate, weight, weightUnit);
    setWeightInput("");
    toast.success("Weight logged!", {
      description: `${weight} ${weightUnit} recorded`,
    });
  };

  // Handle note submission
  const handleNoteSubmit = () => {
    if (noteInput.trim()) {
      setDailyNote(selectedDate, noteInput.trim(), moodInput);
      setNoteInput("");
      toast.success("Note saved!", {
        description: `Feeling ${moodInput} today`,
      });
    } else {
      toast.error("Empty note", {
        description: "Please write something first",
      });
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload an image under 5MB",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addProgressPhoto(dataUrl, selectedDate, photoNote || undefined);
        setPhotoNote("");
        toast.success("Photo uploaded!", {
          description: "Your progress photo has been saved",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const todayNote = getDailyNote(selectedDate);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-purple-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b5cf6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-sm font-medium text-violet-400">
                Progress Dashboard
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Track Your Journey
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Monitor your consistency, muscle training frequency, weight
              progress, and daily notes all in one place.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Workout Consistency Summary */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-card/50 border-border shadow-md rounded-xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-2xl font-semibold">
                    Workout Consistency Summary
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Last 30 days overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
                    >
                      <div className="text-sm font-medium text-emerald-400 mb-2">
                        Days Worked Out
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {consistencyStats.doneCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        in last 30 days
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20"
                    >
                      <div className="text-sm font-medium text-blue-400 mb-2">
                        Scheduled
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {consistencyStats.scheduledCount}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        workout days
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20"
                    >
                      <div className="text-sm font-medium text-violet-400 mb-2">
                        Completion Rate
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {consistencyStats.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        of scheduled
                      </div>
                    </motion.div>
                  </div>

                  {/* Heatmap Calendar */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">
                      Activity Heatmap (Last 30 Days)
                    </h4>
                    <div
                      className="grid gap-1.5"
                      style={{
                        gridTemplateColumns: "repeat(15, minmax(0, 1fr))",
                      }}
                    >
                      {last30Days.map((date, index) => {
                        const dateKey = formatDateKey(date);
                        const status = getWorkoutStatus(date);
                        const isCompleted = status === "done";
                        const isToday =
                          formatDateKey(date) === formatDateKey(today);

                        return (
                          <div
                            key={dateKey}
                            className={cn(
                              "aspect-square rounded-md transition-all duration-200",
                              isCompleted ? "bg-emerald-500" : "bg-muted/40",
                              isToday && "ring-2 ring-violet-400 ring-offset-2"
                            )}
                            title={`${date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })} - ${isCompleted ? "Done" : "Not completed"}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-muted/40" />
                        <span>Not completed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <span>Completed</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Muscle Group Training Frequency */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-card/50 border-border shadow-md rounded-xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-2xl font-semibold">
                    Muscle Group Training Frequency
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Times trained in last 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {muscleFrequency.length > 0 ? (
                    <div className="space-y-4">
                      {muscleFrequency.map((muscle, index) => (
                        <motion.div
                          key={muscle.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {muscle.name}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-bold tabular-nums",
                                muscle.colors.text
                              )}
                            >
                              {muscle.count}x
                            </span>
                          </div>
                          <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${muscle.percentage}%` }}
                              transition={{
                                duration: 0.8,
                                delay: 0.4 + index * 0.1,
                                ease: "easeOut",
                              }}
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r transition-all duration-300 group-hover:shadow-lg",
                                muscle.colors.fill
                              )}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-medium">No completed workouts yet</p>
                      <p className="text-sm mt-1">
                        Start marking workouts as done in the Calendar!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Weight Tracking & Daily Notes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Weight Tracking */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-card/50 border-border shadow-md rounded-xl h-full">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Daily Weight Tracking
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Log your daily weight
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6">
                    <div
                      className="flex gap-2 items-center flex-wrap"
                      style={{ position: "relative", zIndex: 50 }}
                    >
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Enter your weight"
                        value={weightInput}
                        onChange={(e) => {
                          console.log("Weight input changed:", e.target.value);
                          setWeightInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleWeightSubmit();
                          }
                        }}
                        className="flex-1 min-w-[120px]"
                        autoComplete="off"
                        style={{ position: "relative", zIndex: 100 }}
                      />
                      <Select
                        value={weightUnit}
                        onValueChange={(v) => setWeightUnit(v as "kg" | "lbs")}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-[200px]">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year:
                                selectedDate.getFullYear() !==
                                today.getFullYear()
                                  ? "numeric"
                                  : undefined,
                            })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => date > today}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <Button
                        onClick={handleWeightSubmit}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        Log
                      </Button>
                    </div>

                    {/* Weight Chart */}
                    {weightData.length > 0 ? (
                      <div
                        className="space-y-4"
                        style={{ pointerEvents: "none" }}
                      >
                        <div
                          className="h-[200px]"
                          style={{ pointerEvents: "none" }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={weightData}
                              margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                              }}
                            >
                              <defs>
                                <linearGradient
                                  id="weightGradient"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.3}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#71717a", fontSize: 10 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#71717a", fontSize: 10 }}
                                domain={["dataMin - 2", "dataMax + 2"]}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                                labelStyle={{ color: "hsl(var(--foreground))" }}
                                formatter={(
                                  value: any,
                                  _name: any,
                                  props: any
                                ) => [
                                  `${value} ${props?.payload?.unit || "kg"}`,
                                  "Weight",
                                ]}
                              />
                              <Area
                                type="monotone"
                                dataKey="weight"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#weightGradient)"
                                animationDuration={1500}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        {weightData.length >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-center p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                          >
                            {(() => {
                              const first = weightData[0].weight!;
                              const last =
                                weightData[weightData.length - 1].weight!;
                              const diff = last - first;
                              const percentChange = (
                                (diff / first) *
                                100
                              ).toFixed(1);
                              const isGain = diff > 0;
                              return (
                                <div>
                                  <span className="text-sm text-muted-foreground">
                                    Change:{" "}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-lg font-bold",
                                      isGain
                                        ? "text-orange-400"
                                        : "text-emerald-400"
                                    )}
                                  >
                                    {isGain ? "+" : ""}
                                    {diff.toFixed(1)} {weightData[0].unit} (
                                    {isGain ? "+" : ""}
                                    {percentChange}%)
                                  </span>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="font-medium">No weight entries yet</p>
                        <p className="text-sm mt-1">
                          Start logging your weight above!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Daily Notes */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-card/50 border-border shadow-md rounded-xl h-full">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-2xl font-semibold">
                      Daily Notes
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Track mood & feelings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    <Textarea
                      placeholder="How are you feeling today? Any soreness, energy levels, or thoughts about your workout..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Select
                        value={moodInput}
                        onValueChange={(v) =>
                          setMoodInput(v as DailyNote["mood"])
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="great">Great</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="okay">Okay</SelectItem>
                          <SelectItem value="tired">Tired</SelectItem>
                          <SelectItem value="sore">Sore</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleNoteSubmit}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        Save Note
                      </Button>
                    </div>
                    {todayNote && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-amber-400">
                            {todayNote.mood?.toUpperCase() || "NOTE"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •{" "}
                            {selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">
                          {todayNote.note}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Photo Upload */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="bg-card/50 border-border shadow-md rounded-xl">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-2xl font-semibold">
                    Progress Photos
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Document your transformation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-6">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input
                      type="text"
                      placeholder="Photo note (optional)"
                      value={photoNote}
                      onChange={(e) => setPhotoNote(e.target.value)}
                      className="w-48"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[200px]">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          disabled={(date) => date > today}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>

                  {/* Photo Grid */}
                  {progressPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {progressPhotos.map((photo, index) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative group aspect-[3/4] rounded-xl overflow-hidden bg-muted/30 border border-border cursor-pointer hover:border-pink-500/50 transition-all duration-300"
                          onClick={() => setSelectedPhoto(photo.dataUrl)}
                        >
                          <img
                            src={photo.dataUrl}
                            alt={`Progress photo from ${photo.date}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs text-white/90 font-medium">
                                {photo.date}
                              </p>
                              {photo.note && (
                                <p className="text-xs text-white/70 truncate">
                                  {photo.note}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProgressPhoto(photo.id);
                                toast.success("Photo deleted");
                              }}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors duration-200"
                            >
                              <X className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                        <Upload className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium">
                        No progress photos yet
                      </p>
                      <p className="text-sm mt-1">
                        Upload your first photo to start tracking your
                        transformation!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={selectedPhoto}
              alt="Progress photo"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
