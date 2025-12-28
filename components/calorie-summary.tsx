"use client";

import { FoodItem, calculateCalories } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalorieSummaryProps {
  foods: FoodItem[];
}

export function CalorieSummary({ foods }: CalorieSummaryProps) {
  const totalCalories = foods.reduce(
    (sum, food) => sum + calculateCalories(food),
    0
  );

  // Estimate daily calorie target (can be made configurable later)
  const dailyTarget = 2000;
  const percentage = Math.min((totalCalories / dailyTarget) * 100, 100);

  if (foods.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-emerald-600/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Calorie Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Calories Display */}
        <div className="text-center py-4">
          <div className="text-6xl font-bold text-emerald-400 tracking-tight">
            {totalCalories}
          </div>
          <div className="text-muted-foreground mt-1">Total Calories</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Target Progress</span>
            <span className="text-emerald-400 font-medium">
              {totalCalories} / {dailyTarget} kcal
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-lime-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {percentage.toFixed(1)}% of daily target
          </div>
        </div>

        {/* Per-Item Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Breakdown
          </h4>
          <div className="space-y-2">
            {foods.map((food, index) => {
              const calories = calculateCalories(food);
              const itemPercentage =
                totalCalories > 0 ? (calories / totalCalories) * 100 : 0;

              return (
                <div
                  key={food.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{food.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {food.grams}g × {food.calories_per_100g} kcal/100g
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-400">
                      {calories} kcal
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {itemPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <div className="text-2xl font-bold text-foreground">
              {foods.length}
            </div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/20">
            <div className="text-2xl font-bold text-foreground">
              {foods.length > 0
                ? Math.round(totalCalories / foods.length)
                : 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg per Item</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

