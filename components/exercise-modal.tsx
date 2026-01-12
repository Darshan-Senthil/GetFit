"use client";

import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/lib/musclewiki";

interface ExerciseModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExerciseModal({
  exercise,
  isOpen,
  onClose,
}: ExerciseModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeVideoId = getYouTubeVideoId(exercise?.videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;

  // Auto-play video when modal opens (only for non-YouTube videos)
  useEffect(() => {
    if (isOpen && videoRef.current && exercise?.videoUrl && !isYouTubeVideo) {
      videoRef.current.play();
    }
  }, [isOpen, exercise?.videoUrl, isYouTubeVideo]);

  if (!exercise) return null;

  const formatText = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case "beginner":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-card border-border p-0 w-[calc(100%-1rem)] sm:w-full">
        {/* Video/Image Section */}
        <div className="relative aspect-video w-full bg-black">
          {exercise.videoUrl ? (
            isYouTubeVideo && youtubeVideoId ? (
              // YouTube video embed
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
                title={exercise.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              // MP4 video from MuscleWiki
              <video
                ref={videoRef}
                src={exercise.videoUrl}
                poster={exercise.thumbnailUrl || undefined}
                controls
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            )
          ) : exercise.thumbnailUrl ? (
            <img
              src={exercise.thumbnailUrl}
              alt={exercise.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
              <span className="text-muted-foreground">No video available</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {formatText(exercise.name)}
            </DialogTitle>
          </DialogHeader>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`${getDifficultyColor(exercise.difficulty)}`}>
              {formatText(exercise.difficulty)}
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {formatText(exercise.equipment)}
            </Badge>
          </div>

          {/* Muscles Section */}
          <div className="space-y-4">
            {/* Primary Muscles */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Primary Muscles
              </h3>
              <div className="flex flex-wrap gap-2">
                {exercise.primaryMuscles.length > 0 ? (
                  exercise.primaryMuscles.map((muscle, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                      <TargetIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-400">
                        {formatText(muscle)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatText(exercise.target)}
                  </span>
                )}
              </div>
            </div>

            {/* Secondary Muscles */}
            {exercise.secondaryMuscles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Secondary Muscles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border"
                    >
                      <span className="text-sm text-muted-foreground">
                        {formatText(muscle)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Equipment Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Equipment Required
            </h3>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border w-fit">
              <EquipmentIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {formatText(exercise.equipment)}
              </span>
            </div>
          </div>

          {/* Instructions Section */}
          {exercise.instructions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                How to Perform
              </h3>
              <ol className="space-y-3">
                {exercise.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-sm font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-foreground leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tips Section */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <TipIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-400 mb-1">Pro Tips</h4>
                <ul className="text-sm text-amber-200/80 space-y-1">
                  <li>• Keep your core engaged throughout the movement</li>
                  <li>
                    • Control the weight on both the lifting and lowering phases
                  </li>
                  <li>• Focus on proper form over heavy weight</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function EquipmentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 6.5h-2a1 1 0 00-1 1v9a1 1 0 001 1h2m0-11v11m0-11a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1m11-11h2a1 1 0 011 1v9a1 1 0 01-1 1h-2m0-11v11m0-11a1 1 0 00-1-1h-2a1 1 0 00-1 1v11a1 1 0 001 1h2a1 1 0 001-1m-5.5-5.5h-3"
      />
    </svg>
  );
}

function TipIcon({ className }: { className?: string }) {
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
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}
