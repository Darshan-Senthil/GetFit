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
import { Clock, ExternalLink, Heart, Play } from "lucide-react";
import { toast } from "sonner";

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

interface WorkoutPlanModalProps {
  workout: WorkoutDay | null;
  workoutName: string;
  day: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkoutPlanModal({
  workout,
  workoutName,
  day,
  isOpen,
  onClose,
}: WorkoutPlanModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [favorited, setFavorited] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (!workout) return null;

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Estimate workout time (rough calculation: 2-3 min per exercise)
  const estimatedTime = workout.exercises
    ? Math.ceil(workout.exercises.length * 2.5)
    : 0;

  const handleFavorite = () => {
    setFavorited(!favorited);
    toast.success(
      favorited
        ? "Removed from favorites"
        : "Added to favorites"
    );
  };

  // Check if any exercise has a video
  const hasAnyVideo = workout.exercises?.some((ex) => ex.video) || false;
  
  // Get selected exercise video or default to first exercise with video
  const currentExercise = selectedExercise || workout.exercises?.find((ex) => ex.video) || null;
  const videoId = currentExercise ? getYouTubeVideoId(currentExercise.video) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Header Section */}
        <div className="p-6 border-b border-border">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                  {workoutName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                    {day}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {workout.focus || "Full Body"}
                  </Badge>
                  {estimatedTime > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      ~{estimatedTime} min
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
              <TabsTrigger value="video" disabled={!hasAnyVideo}>
                Video {hasAnyVideo && "▶"}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="px-6 pb-6 space-y-6 mt-6">
            {/* Target Muscle Group */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Target Muscle Group
              </h3>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/20 w-fit">
                <span className="text-foreground font-medium">
                  {workout.focus || "Full Body"}
                </span>
              </div>
            </div>

            {/* Exercises List */}
            {workout.exercises && workout.exercises.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Exercises ({workout.exercises.length})
                </h3>
                <div className="space-y-3">
                  {workout.exercises.map((exercise, idx) => {
                    const exVideoId = getYouTubeVideoId(exercise.video);
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-semibold text-foreground">
                                {exercise.name}
                              </span>
                            </div>
                            <div className="ml-8 text-sm text-muted-foreground">
                              <div className="font-medium mb-1">
                                Sets & Reps: {exercise.sets}
                                {exercise.reps && ` (${exercise.reps} reps)`}
                              </div>
                            </div>
                          </div>
                          {exercise.video && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (exVideoId) {
                                  setSelectedExercise(exercise);
                                  setActiveTab("video");
                                } else {
                                  window.open(exercise.video, "_blank");
                                }
                              }}
                              className="text-pink-400 hover:text-pink-300"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {exVideoId ? "Watch" : "Open"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Equipment Required */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Equipment Required
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-muted text-muted-foreground border-border">
                  Based on your preferences
                </Badge>
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
                    Workout Tips
                  </h4>
                  <ul className="text-sm text-amber-200/80 space-y-1">
                    <li>• Warm up for 5-10 minutes before starting</li>
                    <li>• Rest 60-90 seconds between sets</li>
                    <li>• Focus on proper form over heavy weight</li>
                    <li>• Stay hydrated throughout your workout</li>
                    <li>• Cool down and stretch after completing</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="px-6 pb-6 mt-6">
            {videoId && currentExercise ? (
              <div className="space-y-4">
                {/* Exercise Name */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {currentExercise.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentExercise.sets}
                    {currentExercise.reps && ` • ${currentExercise.reps} reps`}
                  </p>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={`${currentExercise.name} - Workout Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0"
                    key={videoId} // Force re-render when video changes
                  />
                </div>

                {/* Open on YouTube Button */}
                {currentExercise.video && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(currentExercise.video, "_blank")
                      }
                      className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open on YouTube
                    </Button>
                  </div>
                )}

                {/* Exercise List for Quick Switching */}
                {workout.exercises && workout.exercises.filter((ex) => ex.video).length > 1 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Other Exercise Videos
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {workout.exercises
                        .filter((ex) => ex.video && ex.name !== currentExercise.name)
                        .map((ex, idx) => {
                          const exVideoId = getYouTubeVideoId(ex.video);
                          return (
                            <Button
                              key={idx}
                              variant="outline"
                              onClick={() => {
                                setSelectedExercise(ex);
                              }}
                              className="justify-start text-left border-border hover:bg-muted/50"
                            >
                              <Play className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate text-sm">{ex.name}</span>
                            </Button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-2">No video available for this workout</p>
                <p className="text-xs">Select an exercise with a video from the Overview tab</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

