"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ExternalLink, Heart, Utensils } from "lucide-react";
import { toast } from "sonner";

interface Meal {
  name: string;
  ingredients: Array<{ item: string; qty: string }>;
  calories: number;
  prep: string;
}

interface MealPlanModalProps {
  meal: Meal | null;
  mealName: string;
  mealType: string;
  day: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MealPlanModal({
  meal,
  mealName,
  mealType,
  day,
  isOpen,
  onClose,
}: MealPlanModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [favorited, setFavorited] = useState(false);

  if (!meal) return null;

  // Estimate prep time (rough calculation based on complexity)
  const estimatePrepTime = (prep: string): number => {
    const prepLower = prep.toLowerCase();
    if (prepLower.includes("quick") || prepLower.includes("simple")) return 10;
    if (prepLower.includes("easy") || prepLower.includes("basic")) return 15;
    if (prepLower.includes("moderate") || prepLower.includes("medium"))
      return 25;
    if (prepLower.includes("complex") || prepLower.includes("advanced"))
      return 45;
    return 20; // default
  };

  const prepTime = estimatePrepTime(meal.prep);

  const handleFavorite = () => {
    setFavorited(!favorited);
    toast.success(
      favorited ? "Removed from favorites" : "Added to favorites"
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Header Section */}
        <div className="p-6 border-b border-border">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                  {mealName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                    {day}
                  </Badge>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {mealType}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {meal.calories} cal
                  </Badge>
                  {prepTime > 0 && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      ~{prepTime} min
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                className={favorited ? "text-pink-400" : ""}
              >
                <Heart
                  className={`w-5 h-5 ${favorited ? "fill-pink-400" : ""}`}
                />
              </Button>
            </div>
          </DialogHeader>
        </div>

        {/* Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="px-6 pb-6 space-y-6 mt-6">
            {/* Meal Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Calories
                </h3>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                  <span className="text-foreground font-semibold text-lg">
                    {meal.calories} cal
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Prep Time
                </h3>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 w-fit">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-foreground font-medium">
                    ~{prepTime} minutes
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Ingredients & Quantities
              </h3>
              {meal.ingredients && meal.ingredients.length > 0 ? (
                <div className="space-y-2">
                  {meal.ingredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">
                          {ingredient.item}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({ingredient.qty})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No ingredients listed
                </p>
              )}
            </div>

            {/* Quick Prep Summary */}
            {meal.prep && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Utensils className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">
                      Quick Prep Summary
                    </h4>
                    <p className="text-sm text-foreground">{meal.prep}</p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="px-6 pb-6 mt-6">
            {meal.prep ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Step-by-Step Cooking Instructions
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <p className="text-foreground leading-relaxed whitespace-pre-line">
                        {meal.prep}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5">
                      💡
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-400 mb-2">
                        Cooking Tips
                      </h4>
                      <ul className="text-sm text-amber-200/80 space-y-1">
                        <li>• Read through all instructions before starting</li>
                        <li>• Prep all ingredients beforehand (mise en place)</li>
                        <li>• Use a timer for precise cooking times</li>
                        <li>• Taste and adjust seasonings as needed</li>
                        <li>• Let meat rest before cutting for better flavor</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No detailed instructions available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

