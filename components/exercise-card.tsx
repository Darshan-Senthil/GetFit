"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  name: string;
  target: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  equipment: string;
  difficulty?: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  onClick?: () => void;
}

export function ExerciseCard({
  name,
  target,
  primaryMuscles = [],
  secondaryMuscles = [],
  equipment,
  difficulty,
  videoUrl,
  thumbnailUrl,
  onClick,
}: ExerciseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Capitalize first letter of each word
  const formatText = (text: string) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleMouseEnter = () => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Difficulty color mapping
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

  // Get display muscles - use primaryMuscles if available, otherwise target
  const displayPrimaryMuscles =
    primaryMuscles.length > 0 ? primaryMuscles : [target];

  return (
    <Card
      className="group relative overflow-hidden bg-card/50 border-border hover:border-red-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Video/Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {/* Loading skeleton */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 bg-muted/20 animate-pulse flex items-center justify-center z-10">
            <svg
              className="w-8 h-8 text-muted-foreground/30 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Error fallback */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <EquipmentIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <span className="text-xs">{formatText(equipment)}</span>
            </div>
          </div>
        )}

        {/* Video element */}
        {videoUrl && !hasError && (
          <video
            ref={videoRef}
            src={videoUrl}
            poster={thumbnailUrl || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Thumbnail fallback when no video */}
        {!videoUrl && thumbnailUrl && !hasError && (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Play indicator */}
        {!isPlaying && videoUrl && !hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-black ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Equipment badge */}
        <Badge className="absolute top-3 left-3 bg-black/50 text-white border-white/20 backdrop-blur-sm">
          {formatText(equipment)}
        </Badge>

        {/* Difficulty badge */}
        {difficulty && (
          <Badge
            className={`absolute top-3 right-3 backdrop-blur-sm ${getDifficultyColor(
              difficulty
            )}`}
          >
            {formatText(difficulty)}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Exercise name */}
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
          {formatText(name)}
        </h3>

        {/* Metadata Row - All on one line with wrapping */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs">
          {/* Primary Muscles */}
          {displayPrimaryMuscles.slice(0, 2).map((muscle, index) => (
            <span
              key={`primary-${index}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-medium"
            >
              <TargetIcon className="w-3 h-3" />
              {formatText(muscle)}
            </span>
          ))}

          {/* Separator dot if secondary muscles exist */}
          {secondaryMuscles.length > 0 && (
            <span className="text-muted-foreground/40">•</span>
          )}

          {/* Secondary Muscles */}
          {secondaryMuscles.slice(0, 2).map((muscle, index) => (
            <span
              key={`secondary-${index}`}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground"
            >
              {formatText(muscle)}
            </span>
          ))}

          {/* Separator dot before equipment */}
          <span className="text-muted-foreground/40">•</span>

          {/* Equipment */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground">
            <EquipmentIcon className="w-3 h-3" />
            {formatText(equipment)}
          </span>
        </div>
      </div>
    </Card>
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
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 6.5h-2a1 1 0 00-1 1v9a1 1 0 001 1h2m0-11v11m0-11a1 1 0 011-1h2a1 1 0 011 1v11a1 1 0 01-1 1h-2a1 1 0 01-1-1m11-11h2a1 1 0 011 1v9a1 1 0 01-1 1h-2m0-11v11m0-11a1 1 0 00-1-1h-2a1 1 0 00-1 1v11a1 1 0 001 1h2a1 1 0 001-1m-5.5-5.5h-3"
      />
    </svg>
  );
}
