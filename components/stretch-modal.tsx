"use client";

import { useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

interface StretchModalProps {
  stretch: Stretch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StretchModal({ stretch, isOpen, onClose }: StretchModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when modal opens
  useEffect(() => {
    if (isOpen && videoRef.current && stretch?.videoUrl) {
      videoRef.current.play();
    }
  }, [isOpen, stretch?.videoUrl]);

  if (!stretch) return null;

  const formatText = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const isPreWorkout = stretch.type === "pre";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border p-0">
        {/* Video/Image Section */}
        <div className="relative aspect-video w-full bg-black">
          {stretch.videoUrl ? (
            <video
              ref={videoRef}
              src={stretch.videoUrl}
              poster={stretch.thumbnailUrl || undefined}
              controls
              loop
              playsInline
              className="w-full h-full object-contain"
            />
          ) : stretch.thumbnailUrl ? (
            <img
              src={stretch.thumbnailUrl}
              alt={stretch.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted/20">
              <span className="text-muted-foreground">No video available</span>
            </div>
          )}

          {/* Duration badge overlay */}
          <Badge className="absolute top-4 right-4 bg-cyan-500/90 text-black border-0 text-sm px-3 py-1">
            <ClockIcon className="w-4 h-4 mr-1.5" />
            {stretch.duration}
          </Badge>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {formatText(stretch.name)}
            </DialogTitle>
          </DialogHeader>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                isPreWorkout
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
              }
            >
              {isPreWorkout ? (
                <>
                  <SunIcon className="w-3.5 h-3.5 mr-1" />
                  Pre-Workout
                </>
              ) : (
                <>
                  <MoonIcon className="w-3.5 h-3.5 mr-1" />
                  Post-Workout
                </>
              )}
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <ClockIcon className="w-3.5 h-3.5 mr-1" />
              {stretch.duration}
            </Badge>
          </div>

          {/* Muscles Section */}
          <div className="space-y-4">
            {/* Primary Muscles */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Primary Muscles Stretched
              </h3>
              <div className="flex flex-wrap gap-2">
                {stretch.primaryMuscles.length > 0 ? (
                  stretch.primaryMuscles.map((muscle, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
                    >
                      <TargetIcon className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm font-medium text-cyan-400">
                        {formatText(muscle)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <TargetIcon className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm font-medium text-cyan-400">
                      {formatText(stretch.target)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Muscles */}
            {stretch.secondaryMuscles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Secondary Muscles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stretch.secondaryMuscles.map((muscle, index) => (
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

          {/* Duration Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Duration
            </h3>
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 w-fit">
              <ClockIcon className="w-5 h-5 text-cyan-400" />
              <span className="text-foreground font-medium">
                Hold for {stretch.duration}
              </span>
            </div>
          </div>

          {/* Instructions Section */}
          {stretch.instructions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                How to Perform
              </h3>
              <ol className="space-y-3">
                {stretch.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-semibold flex items-center justify-center">
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
          <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <div className="flex items-start gap-3">
              <TipIcon className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-teal-400 mb-1">
                  Stretching Tips
                </h4>
                <ul className="text-sm text-teal-200/80 space-y-1">
                  {isPreWorkout ? (
                    <>
                      <li>• Perform dynamic movements, don&apos;t hold static positions</li>
                      <li>• Move through full range of motion gradually</li>
                      <li>• Increase intensity as your muscles warm up</li>
                    </>
                  ) : (
                    <>
                      <li>• Hold each stretch for the recommended duration</li>
                      <li>• Breathe deeply and relax into the stretch</li>
                      <li>• Never bounce or force the stretch</li>
                      <li>• Stop if you feel sharp pain</li>
                    </>
                  )}
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
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

