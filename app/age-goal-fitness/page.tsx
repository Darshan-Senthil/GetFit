"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Dumbbell,
  StretchVertical,
  Filter,
} from "lucide-react";
import { ExerciseCard } from "@/components/exercise-card";
import { ExerciseModal } from "@/components/exercise-modal";
import { StretchCard } from "@/components/stretch-card";
import { StretchModal } from "@/components/stretch-modal";
import { Exercise } from "@/lib/musclewiki";

interface Stretch {
  id: string;
  name: string;
  target: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
  gifUrl?: string | null;
  instructions: string[];
  duration?: string;
  type?: "pre" | "post";
  tags: string[];
  source: "musclewiki" | "ai";
}

interface ExerciseResult extends Exercise {
  tags: string[];
  source: "musclewiki" | "ai";
}

export default function AgeGoalFitnessPage() {
  const [activeTab, setActiveTab] = useState<"workout" | "stretch">("workout");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [muscleGroup, setMuscleGroup] = useState<string>("any");
  const [goal, setGoal] = useState<string>("any");
  const [equipment, setEquipment] = useState<string>("any");

  // Results
  const [exercises, setExercises] = useState<ExerciseResult[]>([]);
  const [stretches, setStretches] = useState<Stretch[]>([]);

  // Modals
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [selectedStretch, setSelectedStretch] = useState<Stretch | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isStretchModalOpen, setIsStretchModalOpen] = useState(false);

  const handleSearch = async () => {
    if (!ageGroup || !gender) {
      setError("Please select age group and gender");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/age-goal-fitness", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ageGroup,
          gender,
          muscleGroup:
            muscleGroup && muscleGroup !== "any" ? muscleGroup : undefined,
          goal: goal && goal !== "any" ? goal : undefined,
          equipment: equipment && equipment !== "any" ? equipment : undefined,
          type: activeTab,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      if (activeTab === "workout") {
        setExercises(data.exercises || []);
      } else {
        setStretches(data.exercises || []);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsExerciseModalOpen(true);
  };

  const handleStretchClick = (stretch: Stretch) => {
    setSelectedStretch(stretch);
    setIsStretchModalOpen(true);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-background to-rose-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12 lg:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
              <span className="text-xs sm:text-sm text-pink-400 font-medium">
                AI-Powered Recommendations
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 sm:mb-4 px-2">
              <span className="text-foreground">Age & Goal Based Fitness</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Get personalized workout and stretch recommendations tailored to
              your age, gender, and fitness goals
            </p>
          </motion.div>

          {/* Toggle Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "workout" | "stretch")
            }
            className="mb-4 sm:mb-8"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger
                value="workout"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Workouts
              </TabsTrigger>
              <TabsTrigger
                value="stretch"
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <StretchVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Stretches
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 border-border shadow-md rounded-xl mb-4 sm:mb-8">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  Filter Options
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Select your preferences to get personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Age Group *
                    </label>
                    <Select value={ageGroup} onValueChange={setAgeGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="13-17">Teen (13-17)</SelectItem>
                        <SelectItem value="18-30">
                          Young Adult (18-30)
                        </SelectItem>
                        <SelectItem value="31-50">Adult (31-50)</SelectItem>
                        <SelectItem value="51-60">
                          Mature Adult (51-60)
                        </SelectItem>
                        <SelectItem value="60+">Senior (60+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Gender *
                    </label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Muscle Group
                    </label>
                    <Select value={muscleGroup} onValueChange={setMuscleGroup}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any muscle group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="chest">Chest</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="shoulders">Shoulders</SelectItem>
                        <SelectItem value="biceps">Biceps</SelectItem>
                        <SelectItem value="triceps">Triceps</SelectItem>
                        <SelectItem value="legs">Legs</SelectItem>
                        <SelectItem value="core">Core</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Goal
                    </label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="strength">Build Strength</SelectItem>
                        <SelectItem value="endurance">
                          Improve Endurance
                        </SelectItem>
                        <SelectItem value="flexibility">
                          Increase Flexibility
                        </SelectItem>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="mobility">
                          Improve Mobility
                        </SelectItem>
                        <SelectItem value="rehabilitation">
                          Rehabilitation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Equipment
                    </label>
                    <Select value={equipment} onValueChange={setEquipment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="bodyweight">
                          Bodyweight Only
                        </SelectItem>
                        <SelectItem value="dumbbells">Dumbbells</SelectItem>
                        <SelectItem value="resistance-bands">
                          Resistance Bands
                        </SelectItem>
                        <SelectItem value="gym">Full Gym Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={handleSearch}
                      disabled={loading || !ageGroup || !gender}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get Recommendations
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Results Section */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Finding the perfect exercises for you...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "workout" && exercises.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Recommended Workouts ({exercises.length})
                    </h2>
                  </div>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {exercises.map((exercise, idx) => (
                      <motion.div
                        key={exercise.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="relative">
                          <ExerciseCard
                            name={exercise.name}
                            target={exercise.target}
                            primaryMuscles={exercise.primaryMuscles}
                            secondaryMuscles={exercise.secondaryMuscles}
                            equipment={exercise.equipment}
                            difficulty={exercise.difficulty}
                            videoUrl={exercise.videoUrl}
                            thumbnailUrl={exercise.thumbnailUrl}
                            gifUrl={(exercise as any).gifUrl || null}
                            onClick={() => handleExerciseClick(exercise)}
                          />
                          {exercise.tags && exercise.tags.length > 0 && (
                            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                              {exercise.tags.slice(0, 2).map((tag, tagIdx) => (
                                <Badge
                                  key={tagIdx}
                                  className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "stretch" && stretches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      Recommended Stretches ({stretches.length})
                    </h2>
                  </div>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {stretches.map((stretch, idx) => (
                      <motion.div
                        key={stretch.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className="relative">
                          <StretchCard
                            name={stretch.name}
                            target={stretch.target}
                            primaryMuscles={stretch.primaryMuscles}
                            duration={stretch.duration || "30 seconds"}
                            videoUrl={stretch.videoUrl}
                            thumbnailUrl={stretch.thumbnailUrl}
                            gifUrl={(stretch as any).gifUrl || null}
                            instructions={stretch.instructions}
                            onClick={() => handleStretchClick(stretch)}
                          />
                          <div className="absolute top-2 right-2">
                            <Badge
                              className={
                                stretch.source === "musclewiki"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              }
                            >
                              {stretch.source === "musclewiki"
                                ? "MuscleWiki"
                                : "AI"}
                            </Badge>
                          </div>
                          {stretch.tags && stretch.tags.length > 0 && (
                            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                              {stretch.tags.slice(0, 2).map((tag, tagIdx) => (
                                <Badge
                                  key={tagIdx}
                                  className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {!loading &&
                exercises.length === 0 &&
                stretches.length === 0 &&
                ageGroup &&
                gender && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      Click "Get Recommendations" to see personalized{" "}
                      {activeTab === "workout" ? "workouts" : "stretches"}
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          isOpen={isExerciseModalOpen}
          onClose={() => {
            setIsExerciseModalOpen(false);
            setSelectedExercise(null);
          }}
        />
      )}

      {selectedStretch && (
        <StretchModal
          stretch={{
            id: parseInt(selectedStretch.id.replace(/\D/g, "")) || 0,
            name: selectedStretch.name,
            target: selectedStretch.target,
            primaryMuscles: selectedStretch.primaryMuscles,
            secondaryMuscles: selectedStretch.secondaryMuscles,
            videoUrl: selectedStretch.videoUrl,
            thumbnailUrl: selectedStretch.thumbnailUrl,
            instructions: selectedStretch.instructions,
            duration: selectedStretch.duration || "30 seconds",
            type: selectedStretch.type || "pre",
          }}
          isOpen={isStretchModalOpen}
          onClose={() => {
            setIsStretchModalOpen(false);
            setSelectedStretch(null);
          }}
        />
      )}
    </main>
  );
}
