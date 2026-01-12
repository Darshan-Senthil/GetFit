"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, User, Dumbbell, UtensilsCrossed, Settings } from "lucide-react";
import { toast } from "sonner";
import { WorkoutPlanModal } from "@/components/workout-plan-modal";
import { MealPlanModal } from "@/components/meal-plan-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UserInfo {
  // Section 1: Personal Profile
  age: string;
  height: string;
  weight: string;
  gender: string;
  bodyFat?: string;
  medicalConditions?: string;
  
  // Section 2: Fitness Background & Preferences
  fitnessExperience: string;
  workoutAccess: string;
  workoutTime: string;
  trainingType: string;
  muscleGroupsFocus?: string;
  muscleGroupsAvoid?: string;
  daysPerWeek: string;
  mobilityConcerns?: string;
  
  // Section 3: Nutrition Preferences & Goals
  goalType: string;
  dietaryPreference: string;
  mealFrequency: string;
  allergies?: string;
  cookingSkill: string;
  budgetRange?: string;
  preferredCuisine?: string;
  kitchenAccess: string;
  
  // Section 4: Optional Enhancements
  sleepHours?: string;
  stressLevel?: string;
  supplements?: string;
  trackCalories: string;
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
  type?: string;
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
  const [activeTab, setActiveTab] = useState("profile");
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: "",
    height: "",
    weight: "",
    gender: "",
    bodyFat: "",
    medicalConditions: "",
    fitnessExperience: "",
    workoutAccess: "",
    workoutTime: "",
    trainingType: "",
    muscleGroupsFocus: "",
    muscleGroupsAvoid: "",
    daysPerWeek: "",
    mobilityConcerns: "",
    goalType: "",
    dietaryPreference: "",
    mealFrequency: "",
    allergies: "",
    cookingSkill: "",
    budgetRange: "",
    preferredCuisine: "",
    kitchenAccess: "",
    sleepHours: "",
    stressLevel: "",
    supplements: "",
    trackCalories: "",
  });
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  
  // Modal states
  const [selectedWorkout, setSelectedWorkout] = useState<{
    workout: WorkoutDay;
    day: string;
  } | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<{
    meal: Meal;
    mealType: string;
    day: string;
  } | null>(null);

  // Auto-calculate BMI
  const bmi = useMemo(() => {
    if (!userInfo.height || !userInfo.weight) return null;
    
    // Parse height (support both cm and ft'in" format)
    let heightInMeters = 0;
    const heightStr = userInfo.height.trim().toLowerCase();
    
    if (heightStr.includes("'") || heightStr.includes('"')) {
      // Format: 5'8" or 5'8
      const parts = heightStr.match(/(\d+)'(\d+)/);
      if (parts) {
        const feet = parseInt(parts[1]);
        const inches = parseInt(parts[2]);
        heightInMeters = (feet * 12 + inches) * 0.0254;
      }
    } else {
      // Assume cm
      const cm = parseFloat(heightStr.replace(/[^0-9.]/g, ""));
      if (cm) heightInMeters = cm / 100;
    }
    
    // Parse weight (assume kg, but support lbs)
    const weightStr = userInfo.weight.trim().toLowerCase();
    let weightInKg = 0;
    
    if (weightStr.includes("lb") || weightStr.includes("lbs")) {
      const lbs = parseFloat(weightStr.replace(/[^0-9.]/g, ""));
      if (lbs) weightInKg = lbs * 0.453592;
    } else {
      const kg = parseFloat(weightStr.replace(/[^0-9.]/g, ""));
      if (kg) weightInKg = kg;
    }
    
    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    
    return null;
  }, [userInfo.height, userInfo.weight]);

  const handleInputChange = (field: keyof UserInfo, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    // Required fields
    const required: (keyof UserInfo)[] = [
      "age",
      "height",
      "weight",
      "gender",
      "fitnessExperience",
      "workoutAccess",
      "workoutTime",
      "trainingType",
      "daysPerWeek",
      "goalType",
      "dietaryPreference",
      "mealFrequency",
      "cookingSkill",
      "kitchenAccess",
      "trackCalories",
    ];
    
    return required.every((field) => {
      const value = userInfo[field];
      return value !== "" && value !== undefined;
    });
  };

  const handleGenerate = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields");
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
                  {plan.workoutPlan && Object.entries(plan.workoutPlan).map(([day, workout]) => {
                    // Check if this is a rest day
                    const isRestDay = 
                      workout?.type?.toLowerCase() === "rest" ||
                      workout?.focus?.toLowerCase() === "rest" ||
                      (!workout?.exercises || workout.exercises.length === 0);
                    
                    return (
                      <motion.div
                        key={day}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card 
                              className={`bg-card/50 border-border shadow-md rounded-xl h-full transition-shadow ${
                                isRestDay 
                                  ? "cursor-not-allowed opacity-75" 
                                  : "cursor-pointer hover:shadow-lg"
                              }`}
                              onClick={() => {
                                if (!isRestDay) {
                                  setSelectedWorkout({ workout, day });
                                }
                              }}
                            >
                              <CardHeader>
                                <CardTitle className="text-lg">{day}</CardTitle>
                                <CardDescription>
                                  {isRestDay ? "Rest Day" : (workout?.focus || "Workout")}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {isRestDay ? (
                                  <div className="py-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                      <span className="text-2xl">😴</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium mb-2">
                                      Rest Day
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Take time to recover and recharge
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="space-y-3">
                                      {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 ? (
                                        workout.exercises.map((exercise, idx) => (
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
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs text-pink-400 hover:text-pink-300 mt-1 inline-block"
                                              >
                                                Watch video →
                                              </a>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No exercises available for this day.</p>
                                      )}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-border">
                                      <p className="text-xs text-pink-400 text-center">
                                        Click to view details →
                                      </p>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          {isRestDay && (
                            <TooltipContent>
                              <p>Rest day – no workouts assigned.</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="meal" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plan.mealPlan && Object.entries(plan.mealPlan).map(([day, meals]) => (
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
                            Total: {meals?.totalCalories || 0} calories
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {[
                            { label: "Breakfast", meal: meals.breakfast },
                            { label: "Lunch", meal: meals.lunch },
                            { label: "Dinner", meal: meals.dinner },
                            { label: "Snack", meal: meals.snack },
                          ].filter(({ meal }) => meal).map(({ label, meal }) => (
                            <div
                              key={label}
                              className="p-3 rounded-lg bg-muted/30 border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => setSelectedMeal({ meal, mealType: label, day })}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">
                                  {label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {meal?.calories || 0} cal
                                </span>
                              </div>
                              <div className="text-sm font-medium mb-1">
                                {meal?.name || "No meal specified"}
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                <div className="font-medium mb-1">Ingredients:</div>
                                {meal.ingredients && Array.isArray(meal.ingredients) && meal.ingredients.length > 0 ? (
                                  meal.ingredients.slice(0, 3).map((ing, idx) => (
                                    <div key={idx}>
                                      • {ing.item} ({ing.qty})
                                    </div>
                                  ))
                                ) : (
                                  <div>No ingredients listed</div>
                                )}
                                {meal.ingredients && meal.ingredients.length > 3 && (
                                  <div className="text-pink-400 mt-1">
                                    +{meal.ingredients.length - 3} more...
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-xs text-pink-400 text-center">
                                  Click for details →
                                </p>
                              </div>
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
                  setSelectedWorkout(null);
                  setSelectedMeal(null);
                }}
                variant="outline"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
              >
                Generate New Plan
              </Button>
            </div>
          </div>
        </div>

        {/* Workout Modal */}
        {selectedWorkout && (
          <WorkoutPlanModal
            workout={selectedWorkout.workout}
            workoutName={`${selectedWorkout.day} - ${selectedWorkout.workout.focus || "Workout"}`}
            day={selectedWorkout.day}
            isOpen={!!selectedWorkout}
            onClose={() => setSelectedWorkout(null)}
          />
        )}

        {/* Meal Modal */}
        {selectedMeal && (
          <MealPlanModal
            meal={selectedMeal.meal}
            mealName={selectedMeal.meal.name}
            mealType={selectedMeal.mealType}
            day={selectedMeal.day}
            isOpen={!!selectedMeal}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/50 via-background to-rose-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
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
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="fitness" className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      <span className="hidden sm:inline">Fitness</span>
                    </TabsTrigger>
                    <TabsTrigger value="nutrition" className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span className="hidden sm:inline">Nutrition</span>
                    </TabsTrigger>
                    <TabsTrigger value="optional" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Optional</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Section 1: Personal Profile */}
                  <TabsContent value="profile" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Profile</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Essential information for calculating your BMR & TDEE
                      </p>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
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
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="e.g., 24"
                          value={userInfo.age}
                          onChange={(e) => handleInputChange("age", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Height *</Label>
                        <Input
                          id="height"
                          type="text"
                          placeholder="e.g., 172 cm or 5'8&quot;"
                          value={userInfo.height}
                          onChange={(e) => handleInputChange("height", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter in cm or feet'inches format
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight *</Label>
                        <Input
                          id="weight"
                          type="text"
                          placeholder="e.g., 78 kg or 172 lbs"
                          value={userInfo.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter in kg or lbs
                        </p>
                      </div>

                      {bmi && (
                        <div className="space-y-2 md:col-span-2">
                          <Label>BMI (Auto-calculated)</Label>
                          <div className="p-3 rounded-md bg-muted/30 border border-border">
                            <span className="text-lg font-semibold">{bmi}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {parseFloat(bmi) < 18.5
                                ? "Underweight"
                                : parseFloat(bmi) < 25
                                ? "Normal"
                                : parseFloat(bmi) < 30
                                ? "Overweight"
                                : "Obese"}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="bodyFat">Body Fat % (Optional)</Label>
                        <Input
                          id="bodyFat"
                          type="text"
                          placeholder="e.g., 15%"
                          value={userInfo.bodyFat}
                          onChange={(e) => handleInputChange("bodyFat", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave empty if unknown
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="medicalConditions">Medical Conditions / Injuries (Optional)</Label>
                        <Textarea
                          id="medicalConditions"
                          placeholder="e.g., Lower back pain, knee injury, diabetes..."
                          value={userInfo.medicalConditions}
                          onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Help us avoid certain exercises or dietary components
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Section 2: Fitness Background & Preferences */}
                  <TabsContent value="fitness" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Fitness Background & Preferences</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Help us tailor your workout plan
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fitnessExperience">Fitness Experience Level *</Label>
                        <Select
                          value={userInfo.fitnessExperience}
                          onValueChange={(value) => handleInputChange("fitnessExperience", value)}
                        >
                          <SelectTrigger id="fitnessExperience">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workoutAccess">Workout Access *</Label>
                        <Select
                          value={userInfo.workoutAccess}
                          onValueChange={(value) => handleInputChange("workoutAccess", value)}
                        >
                          <SelectTrigger id="workoutAccess">
                            <SelectValue placeholder="Select workout access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gym">Gym</SelectItem>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="dumbbells-only">Dumbbells Only</SelectItem>
                            <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                            <SelectItem value="limited-equipment">Limited Equipment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="workoutTime">Workout Time Available *</Label>
                        <Select
                          value={userInfo.workoutTime}
                          onValueChange={(value) => handleInputChange("workoutTime", value)}
                        >
                          <SelectTrigger id="workoutTime">
                            <SelectValue placeholder="Select time available" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120+ minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trainingType">Preferred Training Type *</Label>
                        <Select
                          value={userInfo.trainingType}
                          onValueChange={(value) => handleInputChange("trainingType", value)}
                        >
                          <SelectTrigger id="trainingType">
                            <SelectValue placeholder="Select training type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weights">Weights</SelectItem>
                            <SelectItem value="calisthenics">Calisthenics</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="pilates">Pilates</SelectItem>
                            <SelectItem value="cardio">Cardio</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="daysPerWeek">Days per Week *</Label>
                        <Select
                          value={userInfo.daysPerWeek}
                          onValueChange={(value) => handleInputChange("daysPerWeek", value)}
                        >
                          <SelectTrigger id="daysPerWeek">
                            <SelectValue placeholder="Select days per week" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 days</SelectItem>
                            <SelectItem value="4">4 days</SelectItem>
                            <SelectItem value="5">5 days</SelectItem>
                            <SelectItem value="6">6 days</SelectItem>
                            <SelectItem value="7">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="muscleGroupsFocus">Muscle Groups to Focus (Optional)</Label>
                        <Input
                          id="muscleGroupsFocus"
                          type="text"
                          placeholder="e.g., Glutes, Core, Back"
                          value={userInfo.muscleGroupsFocus}
                          onChange={(e) => handleInputChange("muscleGroupsFocus", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="muscleGroupsAvoid">Muscle Groups to Avoid (Optional)</Label>
                        <Input
                          id="muscleGroupsAvoid"
                          type="text"
                          placeholder="e.g., Shoulders, Lower back"
                          value={userInfo.muscleGroupsAvoid}
                          onChange={(e) => handleInputChange("muscleGroupsAvoid", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="mobilityConcerns">Mobility/Flexibility Concerns (Optional)</Label>
                        <Textarea
                          id="mobilityConcerns"
                          placeholder="e.g., Tight hamstrings, limited shoulder mobility..."
                          value={userInfo.mobilityConcerns}
                          onChange={(e) => handleInputChange("mobilityConcerns", e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Important for warmups, cooldowns, and stretches
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Section 3: Nutrition Preferences & Goals */}
                  <TabsContent value="nutrition" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Nutrition Preferences & Goals</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Help us create your perfect meal plan
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="goalType">Goal Type *</Label>
                        <Select
                          value={userInfo.goalType}
                          onValueChange={(value) => handleInputChange("goalType", value)}
                        >
                          <SelectTrigger id="goalType">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fat-loss">Fat Loss</SelectItem>
                            <SelectItem value="muscle-gain">Gain Muscle</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="recomposition">Recomposition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dietaryPreference">Dietary Preference *</Label>
                        <Select
                          value={userInfo.dietaryPreference}
                          onValueChange={(value) => handleInputChange("dietaryPreference", value)}
                        >
                          <SelectTrigger id="dietaryPreference">
                            <SelectValue placeholder="Select diet preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="vegan">Vegan</SelectItem>
                            <SelectItem value="keto">Keto</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="gluten-free">Gluten-free</SelectItem>
                            <SelectItem value="paleo">Paleo</SelectItem>
                            <SelectItem value="mediterranean">Mediterranean</SelectItem>
                            <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mealFrequency">Meal Frequency *</Label>
                        <Select
                          value={userInfo.mealFrequency}
                          onValueChange={(value) => handleInputChange("mealFrequency", value)}
                        >
                          <SelectTrigger id="mealFrequency">
                            <SelectValue placeholder="Select meal frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2-meals">2 meals/day</SelectItem>
                            <SelectItem value="3-meals">3 meals/day</SelectItem>
                            <SelectItem value="3-meals-snacks">3 meals + snacks</SelectItem>
                            <SelectItem value="4-meals">4 meals/day</SelectItem>
                            <SelectItem value="5-6-meals">5-6 meals/day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cookingSkill">Cooking Skill Level *</Label>
                        <Select
                          value={userInfo.cookingSkill}
                          onValueChange={(value) => handleInputChange("cookingSkill", value)}
                        >
                          <SelectTrigger id="cookingSkill">
                            <SelectValue placeholder="Select cooking skill" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="none">No cooking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="kitchenAccess">Kitchen Access *</Label>
                        <Select
                          value={userInfo.kitchenAccess}
                          onValueChange={(value) => handleInputChange("kitchenAccess", value)}
                        >
                          <SelectTrigger id="kitchenAccess">
                            <SelectValue placeholder="Select kitchen access" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full-kitchen">Full Kitchen Access</SelectItem>
                            <SelectItem value="meal-prep-only">Meal Prep Only</SelectItem>
                            <SelectItem value="no-kitchen">No Kitchen Access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trackCalories">Track Calories or Eat Intuitively? *</Label>
                        <Select
                          value={userInfo.trackCalories}
                          onValueChange={(value) => handleInputChange("trackCalories", value)}
                        >
                          <SelectTrigger id="trackCalories">
                            <SelectValue placeholder="Select preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="track">Track Calories</SelectItem>
                            <SelectItem value="intuitive">Eat Intuitively</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredCuisine">Preferred Cuisine Type (Optional)</Label>
                        <Input
                          id="preferredCuisine"
                          type="text"
                          placeholder="e.g., Italian, Asian, Mexican, Indian..."
                          value={userInfo.preferredCuisine}
                          onChange={(e) => handleInputChange("preferredCuisine", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="budgetRange">Budget Range (Optional)</Label>
                        <Select
                          value={userInfo.budgetRange}
                          onValueChange={(value) => handleInputChange("budgetRange", value)}
                        >
                          <SelectTrigger id="budgetRange">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Budget</SelectItem>
                            <SelectItem value="medium">Medium Budget</SelectItem>
                            <SelectItem value="high">High Budget</SelectItem>
                            <SelectItem value="no-limit">No Limit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="allergies">Allergies / Food Restrictions (Optional)</Label>
                        <Textarea
                          id="allergies"
                          placeholder="e.g., Nuts, Dairy, Shellfish..."
                          value={userInfo.allergies}
                          onChange={(e) => handleInputChange("allergies", e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Section 4: Optional Enhancements */}
                  <TabsContent value="optional" className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Optional Enhancements</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Additional information for holistic recommendations
                      </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sleepHours">Sleep Hours per Day (Optional)</Label>
                        <Select
                          value={userInfo.sleepHours}
                          onValueChange={(value) => handleInputChange("sleepHours", value)}
                        >
                          <SelectTrigger id="sleepHours">
                            <SelectValue placeholder="Select sleep hours" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less-than-5">Less than 5 hours</SelectItem>
                            <SelectItem value="5-6">5-6 hours</SelectItem>
                            <SelectItem value="6-7">6-7 hours</SelectItem>
                            <SelectItem value="7-8">7-8 hours</SelectItem>
                            <SelectItem value="8-9">8-9 hours</SelectItem>
                            <SelectItem value="more-than-9">More than 9 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stressLevel">Stress Levels (Optional)</Label>
                        <Select
                          value={userInfo.stressLevel}
                          onValueChange={(value) => handleInputChange("stressLevel", value)}
                        >
                          <SelectTrigger id="stressLevel">
                            <SelectValue placeholder="Select stress level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="supplements">Supplements Used (Optional)</Label>
                        <Textarea
                          id="supplements"
                          placeholder="e.g., Protein powder, Creatine, Multivitamin..."
                          value={userInfo.supplements}
                          onChange={(e) => handleInputChange("supplements", e.target.value)}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          Helps avoid overlapping suggestions
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-8 pt-6 border-t border-border">
                  <Button
                    onClick={handleGenerate}
                    disabled={!isFormValid()}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate My Plan
                  </Button>
                  {!isFormValid() && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please fill in all required fields (marked with *)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
