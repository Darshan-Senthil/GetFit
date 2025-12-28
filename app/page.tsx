"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { ImagePreview } from "@/components/image-preview";
import { FoodResultsTable } from "@/components/food-results-table";
import { CalorieSummary } from "@/components/calorie-summary";
import {
  FoodItem,
  AnalyzeResponse,
  PORTION_GRAMS,
  generateId,
} from "@/lib/types";

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
    setFoods([]);
    setError(null);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setFoods([]);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data: AnalyzeResponse = await response.json();

      // Convert API response to FoodItems with IDs and default grams
      const foodItems: FoodItem[] = data.foods.map((food) => ({
        id: generateId(),
        label: food.label,
        confidence: food.confidence,
        portion_guess: food.portion_guess,
        calories_per_100g: food.calories_per_100g,
        grams: PORTION_GRAMS[food.portion_guess],
      }));

      setFoods(foodItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateFood = (id: string, updates: Partial<FoodItem>) => {
    setFoods((prev) =>
      prev.map((food) => (food.id === id ? { ...food, ...updates } : food))
    );
  };

  const handleRemoveFood = (id: string) => {
    setFoods((prev) => prev.filter((food) => food.id !== id));
  };

  const handleAddFood = () => {
    const newFood: FoodItem = {
      id: generateId(),
      label: "New food item",
      confidence: 1,
      portion_guess: "medium",
      calories_per_100g: 100,
      grams: 150,
    };
    setFoods((prev) => [...prev, newFood]);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-background to-lime-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-emerald-400 font-medium">
                AI-Powered Nutrition Analysis
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Track</span>
              <span className="text-emerald-400"> Calories</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a photo of your meal and let AI instantly analyze the
              nutritional content. Track your calories with precision and ease.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Preview */}
            <div className="space-y-6">
              {!imageBase64 ? (
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  disabled={isAnalyzing}
                />
              ) : (
                <ImagePreview
                  imageBase64={imageBase64}
                  onRemove={handleRemoveImage}
                  onAnalyze={handleAnalyze}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Results Table */}
              <FoodResultsTable
                foods={foods}
                onUpdateFood={handleUpdateFood}
                onRemoveFood={handleRemoveFood}
                onAddFood={handleAddFood}
              />
            </div>

            {/* Right Column - Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <CalorieSummary foods={foods} />

              {/* Empty State */}
              {foods.length === 0 && (
                <div className="text-center py-16 px-8">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-emerald-500/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    Upload a meal image and click &quot;Analyze&quot; to see
                    nutritional breakdown
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with Next.js, OpenAI Vision, and shadcn/ui</p>
        </div>
      </footer>
    </main>
  );
}
