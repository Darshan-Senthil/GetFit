"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface UserInfo {
  gender: string;
  age: string;
  height: string;
  weight: string;
  activityLevel: string;
  dietPreference: string;
  goal: string;
  workoutAccess: string;
  timePerDay: string;
}

interface Exercise {
  name: string;
  sets: string;
  reps?: string;
  video?: string;
}

interface WorkoutDay {
  focus: string;
  exercises: Exercise[];
}

interface Meal {
  name: string;
  ingredients: Array<{ item: string; qty: string }>;
  calories: number;
  prep: string;
}

interface MealDay {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack: Meal;
  totalCalories: number;
}

interface PlanResponse {
  workoutPlan: Record<string, WorkoutDay>;
  mealPlan: Record<string, MealDay>;
}

export default function PersonalizedPlanPage() {
  const [step, setStep] = useState<"form" | "loading" | "results">("form");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    gender: "",
    age: "",
    height: "",
    weight: "",
    activityLevel: "",
    dietPreference: "",
    goal: "",
    workoutAccess: "",
    timePerDay: "",
  });
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return Object.values(userInfo).every((value) => value !== "");
  };

  const handleGenerate = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all fields");
      return;
    }

    setStep("loading");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();
      setPlan(data);
      setStep("results");
      toast.success("Your personalized plan has been generated!");
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
      setStep("form");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (step === "loading") {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-background to-rose-950/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Generating Your Plan
                </h2>
                <p className="text-muted-foreground">
                  Our AI is creating a personalized workout and meal plan just for you...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    );
  }

  if (step === "results" && plan) {
    return (
      <main className="min-h-screen bg-background">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-background to-rose-950/30 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-pink-400 font-medium">
                  AI Generated Plan
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <span className="text-foreground">Your Personalized Plan</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your custom 7-day workout and meal plan is ready!
              </p>
            </motion.div>

            <Tabs defaultValue="workout" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="workout">Workout Plan</TabsTrigger>
                <TabsTrigger value="meal">Meal Plan</TabsTrigger>
              </TabsList>

              <TabsContent value="workout" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(plan.workoutPlan).map(([day, workout]) => (
                    <motion.div
                      key={day}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="bg-card/50 border-border shadow-md rounded-xl h-full">
                        <CardHeader>
                          <CardTitle className="text-lg">{day}</CardTitle>
                          <CardDescription>{workout.focus}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {workout.exercises.map((exercise, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-muted/30 border border-border"
                              >
                                <div className="flex items-start justify-between mb-1">
                                  <span className="font-medium text-sm">
                                    {exercise.name}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {exercise.sets}
                                  {exercise.reps && ` • ${exercise.reps} reps`}
                                </div>
                                {exercise.video && (
                                  <a
                                    href={exercise.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-pink-400 hover:text-pink-300 mt-1 inline-block"
                                  >
                                    Watch video →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="meal" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(plan.mealPlan).map(([day, meals]) => (
                    <motion.div
                      key={day}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="bg-card/50 border-border shadow-md rounded-xl h-full">
                        <CardHeader>
                          <CardTitle className="text-lg">{day}</CardTitle>
                          <CardDescription>
                            Total: {meals.totalCalories} calories
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { label: "Breakfast", meal: meals.breakfast },
                            { label: "Lunch", meal: meals.lunch },
                            { label: "Dinner", meal: meals.dinner },
                            { label: "Snack", meal: meals.snack },
                          ].map(({ label, meal }) => (
                            <div
                              key={label}
                              className="p-3 rounded-lg bg-muted/30 border border-border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">
                                  {label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {meal.calories} cal
                                </span>
                              </div>
                              <div className="text-sm font-medium mb-1">
                                {meal.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                <div className="font-medium mb-1">Ingredients:</div>
                                {meal.ingredients.map((ing, idx) => (
                                  <div key={idx}>
                                    • {ing.item} ({ing.qty})
                                  </div>
                                ))}
                              </div>
                              {meal.prep && (
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                                  <div className="font-medium mb-1">Prep:</div>
                                  {meal.prep}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <Button
                onClick={() => {
                  setStep("form");
                  setPlan(null);
                }}
                variant="outline"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
              >
                Generate New Plan
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-background to-rose-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-400 font-medium">
                AI-Powered Planning
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Personalized Plan</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a custom workout and meal plan tailored to your goals, preferences, and lifestyle.
            </p>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card/50 border-border shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">
                  Tell Us About Yourself
                </CardTitle>
                <CardDescription>
                  Fill in your details to get a personalized fitness and nutrition plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={userInfo.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="e.g., 24"
                      value={userInfo.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="text"
                      placeholder="e.g., 172 cm or 5'8&quot;"
                      value={userInfo.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      type="text"
                      placeholder="e.g., 78 kg"
                      value={userInfo.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activityLevel">Activity Level</Label>
                    <Select
                      value={userInfo.activityLevel}
                      onValueChange={(value) =>
                        handleInputChange("activityLevel", value)
                      }
                    >
                      <SelectTrigger id="activityLevel">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietPreference">Diet Preference</Label>
                    <Select
                      value={userInfo.dietPreference}
                      onValueChange={(value) =>
                        handleInputChange("dietPreference", value)
                      }
                    >
                      <SelectTrigger id="dietPreference">
                        <SelectValue placeholder="Select diet preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="mediterranean">Mediterranean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Fitness Goal</Label>
                    <Select
                      value={userInfo.goal}
                      onValueChange={(value) => handleInputChange("goal", value)}
                    >
                      <SelectTrigger id="goal">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight-loss">Weight Loss</SelectItem>
                        <SelectItem value="weight-gain">Weight Gain</SelectItem>
                        <SelectItem value="body-recomposition">
                          Body Recomposition
                        </SelectItem>
                        <SelectItem value="muscle-building">Muscle Building</SelectItem>
                        <SelectItem value="endurance-cardio">
                          Endurance & Cardio
                        </SelectItem>
                        <SelectItem value="maintenance">
                          Maintenance & General Fitness
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workoutAccess">Workout Access</Label>
                    <Select
                      value={userInfo.workoutAccess}
                      onValueChange={(value) =>
                        handleInputChange("workoutAccess", value)
                      }
                    >
                      <SelectTrigger id="workoutAccess">
                        <SelectValue placeholder="Select workout access" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gym">Gym</SelectItem>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="dumbbells-only">
                          Dumbbells Only
                        </SelectItem>
                        <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timePerDay">Time per Day</Label>
                    <Select
                      value={userInfo.timePerDay}
                      onValueChange={(value) =>
                        handleInputChange("timePerDay", value)
                      }
                    >
                      <SelectTrigger id="timePerDay">
                        <SelectValue placeholder="Select time available" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!isFormValid()}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  size="lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate My Plan
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

