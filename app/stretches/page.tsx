"use client";

import { useState, useEffect } from "react";
import {
  StretchMuscleSelector,
  StretchMuscleGroup,
} from "@/components/stretch-muscle-selector";
import { StretchCard } from "@/components/stretch-card";
import { StretchModal } from "@/components/stretch-modal";
import { TodaysTraining } from "@/components/todays-training";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MuscleTarget } from "@/lib/weeklyWorkout";

interface Stretch {
  id: number;
  name: string;
  target: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
  instructions: string[];
  duration: string;
  type: "pre" | "post";
}

interface StretchesResponse {
  count: number;
  preWorkout: Stretch[];
  postWorkout: Stretch[];
}

export default function StretchesPage() {
  const [selectedMuscle, setSelectedMuscle] =
    useState<StretchMuscleGroup | null>(null);
  const [stretches, setStretches] = useState<StretchesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pre" | "post">("pre");
  const [selectedStretch, setSelectedStretch] = useState<Stretch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStretchClick = (stretch: Stretch) => {
    setSelectedStretch(stretch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStretch(null);
  };

  // Handle selection from Today's Training pills
  const handleTodaysTrainingSelect = (muscle: MuscleTarget) => {
    // Create a StretchMuscleGroup-like object from MuscleTarget
    const muscleGroup: StretchMuscleGroup = {
      id: muscle.id as StretchMuscleGroup["id"],
      label: muscle.label,
      muscleId: muscle.muscleId,
      icon: () => null, // Icon not needed for functionality
    };
    setSelectedMuscle(muscleGroup);
  };

  useEffect(() => {
    if (!selectedMuscle) {
      setStretches(null);
      return;
    }

    const fetchStretches = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/stretches/${selectedMuscle.muscleId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch stretches");
        }

        const data: StretchesResponse = await res.json();
        setStretches(data);
      } catch (err) {
        console.error("Error fetching stretches:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load stretches"
        );
        setStretches(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStretches();
  }, [selectedMuscle]);

  const currentStretches =
    activeTab === "pre" ? stretches?.preWorkout : stretches?.postWorkout;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient - cyan theme for stretches */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-background to-teal-950/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2306b6d4' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-sm text-cyan-400 font-medium">
                Flexibility & Recovery
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Stretches</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Prepare your muscles before training and recover properly after.
              Select a muscle group to find targeted stretches.
            </p>

            {/* Muscle Group Selector */}
            <StretchMuscleSelector
              selected={selectedMuscle}
              onSelect={setSelectedMuscle}
            />

            {/* Today's Training Section - Below selector */}
            <TodaysTraining
              onSelectMuscle={handleTodaysTrainingSelect}
              selectedMuscleId={selectedMuscle?.muscleId}
              accentColor="cyan"
            />
          </div>

          {/* Stretch List */}
          {selectedMuscle ? (
            <div className="mt-8">
              {/* Pre/Post Workout Tabs */}
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "pre" | "post")}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {selectedMuscle.label} Stretches
                  </h2>
                  <TabsList className="bg-muted/30 border border-border">
                    <TabsTrigger
                      value="pre"
                      className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                    >
                      <SunIcon className="w-4 h-4 mr-2" />
                      Pre-Workout
                    </TabsTrigger>
                    <TabsTrigger
                      value="post"
                      className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                    >
                      <MoonIcon className="w-4 h-4 mr-2" />
                      Post-Workout
                    </TabsTrigger>
                  </TabsList>
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
                      Failed to Load Stretches
                    </h3>
                    <p className="text-sm text-muted-foreground/70">{error}</p>
                  </div>
                )}

                {/* Tab Contents */}
                {!loading && !error && stretches && (
                  <>
                    <TabsContent value="pre" className="mt-0">
                      <div className="mb-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <SunIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-400 mb-1">
                              Pre-Workout Stretches
                            </h4>
                            <p className="text-sm text-amber-200/80">
                              Dynamic stretches to warm up your muscles and
                              increase blood flow before training.
                            </p>
                          </div>
                        </div>
                      </div>

                      {stretches.preWorkout.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {stretches.preWorkout.map((stretch) => (
                            <StretchCard
                              key={stretch.id}
                              name={stretch.name}
                              target={stretch.target}
                              primaryMuscles={stretch.primaryMuscles}
                              duration={stretch.duration}
                              videoUrl={stretch.videoUrl}
                              thumbnailUrl={stretch.thumbnailUrl}
                              instructions={stretch.instructions}
                              onClick={() => handleStretchClick(stretch)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No pre-workout stretches found for this muscle group" />
                      )}
                    </TabsContent>

                    <TabsContent value="post" className="mt-0">
                      <div className="mb-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="flex items-start gap-3">
                          <MoonIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-indigo-400 mb-1">
                              Post-Workout Stretches
                            </h4>
                            <p className="text-sm text-indigo-200/80">
                              Static stretches to cool down, improve
                              flexibility, and aid muscle recovery.
                            </p>
                          </div>
                        </div>
                      </div>

                      {stretches.postWorkout.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {stretches.postWorkout.map((stretch) => (
                            <StretchCard
                              key={stretch.id}
                              name={stretch.name}
                              target={stretch.target}
                              primaryMuscles={stretch.primaryMuscles}
                              duration={stretch.duration}
                              videoUrl={stretch.videoUrl}
                              thumbnailUrl={stretch.thumbnailUrl}
                              instructions={stretch.instructions}
                              onClick={() => handleStretchClick(stretch)}
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyState message="No post-workout stretches found for this muscle group" />
                      )}
                    </TabsContent>
                  </>
                )}
              </Tabs>
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
                Choose a muscle group above to view stretches
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Stretch data powered by{" "}
            <a
              href="https://musclewiki.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              MuscleWiki
            </a>
          </p>
        </div>
      </footer>

      {/* Stretch Detail Modal */}
      <StretchModal
        stretch={selectedStretch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-muted-foreground/30"
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
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
      />
    </svg>
  );
}
