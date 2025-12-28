"use client";

import { useState, useEffect } from "react";
import {
  MuscleGroupSelector,
  MuscleGroup,
} from "@/components/muscle-group-selector";
import { ExerciseCard } from "@/components/exercise-card";
import { ExerciseModal } from "@/components/exercise-modal";
import { TodaysTraining } from "@/components/todays-training";
import { Exercise } from "@/lib/musclewiki";
import { MuscleTarget } from "@/lib/weeklyWorkout";

export default function WorkoutsPage() {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(
    null
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExercise(null);
  };

  // Handle selection from Today's Training pills
  const handleTodaysTrainingSelect = (muscle: MuscleTarget) => {
    // Create a MuscleGroup-like object from MuscleTarget
    const muscleGroup: MuscleGroup = {
      id: muscle.id as MuscleGroup["id"],
      label: muscle.label,
      muscleId: muscle.muscleId,
      icon: () => null, // Icon not needed for functionality
    };
    setSelectedMuscle(muscleGroup);
  };

  useEffect(() => {
    if (!selectedMuscle) {
      setExercises([]);
      return;
    }

    const fetchExercises = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/musclewiki/${selectedMuscle.muscleId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch exercises");
        }

        const data = await res.json();
        setExercises(data.exercises);
      } catch (err) {
        console.error("Error fetching exercises:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load exercises"
        );
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [selectedMuscle]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient - red theme for workouts */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-background to-rose-950/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-sm text-red-400 font-medium">
                Exercise Library
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Workouts</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Browse exercises by muscle group. Hover over cards to preview
              exercise videos.
            </p>

            {/* Muscle Group Selector */}
            <MuscleGroupSelector
              selected={selectedMuscle}
              onSelect={setSelectedMuscle}
            />

            {/* Today's Training Section - Below selector */}
            <TodaysTraining
              onSelectMuscle={handleTodaysTrainingSelect}
              selectedMuscleId={selectedMuscle?.muscleId}
              accentColor="red"
            />
          </div>

          {/* Exercise List */}
          {selectedMuscle ? (
            <div className="mt-8">
              {/* Results header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedMuscle.label} Exercises
                </h2>
                {!loading && exercises.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {exercises.length} exercises found
                  </span>
                )}
              </div>

              {/* Loading state */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl bg-card/50 border border-border animate-pulse"
                    >
                      <div className="aspect-video bg-muted/30" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-muted/30 rounded w-3/4" />
                        <div className="h-4 bg-muted/30 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-red-500/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Failed to Load Exercises
                  </h3>
                  <p className="text-sm text-muted-foreground/70">{error}</p>
                </div>
              )}

              {/* Exercise grid */}
              {!loading && !error && exercises.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      name={exercise.name}
                      target={exercise.target}
                      primaryMuscles={exercise.primaryMuscles}
                      secondaryMuscles={exercise.secondaryMuscles}
                      equipment={exercise.equipment}
                      difficulty={exercise.difficulty}
                      videoUrl={exercise.videoUrl}
                      thumbnailUrl={exercise.thumbnailUrl}
                      onClick={() => handleExerciseClick(exercise)}
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && exercises.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                    <svg
                      className="w-10 h-10 text-muted-foreground/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No Exercises Found
                  </h3>
                  <p className="text-sm text-muted-foreground/70">
                    Try selecting a different muscle group
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Empty state - no selection */
            <div className="mt-8 text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-muted-foreground/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Select a Muscle Group
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Choose a muscle group above to view exercises
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Exercise data powered by{" "}
            <a
              href="https://musclewiki.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:underline"
            >
              MuscleWiki
            </a>
          </p>
        </div>
      </footer>

      {/* Exercise Detail Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}
