"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StretchCardProps {
  name: string;
  target: string;
  primaryMuscles?: string[];
  duration: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  gifUrl?: string | null;
  instructions?: string[];
  onClick?: () => void;
}

export function StretchCard({
  name,
  target,
  primaryMuscles = [],
  duration,
  videoUrl,
  thumbnailUrl,
  gifUrl,
  instructions = [],
  onClick,
}: StretchCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatText = (text: string | null | undefined) => {
    if (!text) return "";
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Check if videoUrl is a YouTube URL
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTubeVideo = !!youtubeVideoId;
  
  // Determine media source priority
  const hasGif = !!gifUrl;
  const hasMuscleWikiVideo = videoUrl && !isYouTubeVideo;
  const hasYouTubeVideo = isYouTubeVideo;
  const hasThumbnail = !!thumbnailUrl;
  const hasNoMedia = !hasGif && !hasMuscleWikiVideo && !hasYouTubeVideo && !hasThumbnail;

  // Set loading to false if no media is available
  useEffect(() => {
    if (hasNoMedia) {
      setIsLoading(false);
    }
  }, [hasNoMedia]);

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

  const displayMuscles = primaryMuscles.length > 0 ? primaryMuscles : [target];

  return (
    <Card
      className="group relative overflow-hidden bg-card/50 border-border hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer"
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
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <StretchIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <span className="text-xs">Stretch</span>
            </div>
          </div>
        )}

        {/* Priority 1: GIF from MuscleWiki */}
        {hasGif && gifUrl && !hasError && (
          <img
            src={gifUrl}
            alt={name}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Priority 2: MP4 Video from MuscleWiki */}
        {!hasGif && hasMuscleWikiVideo && videoUrl && !hasError && (
          <>
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
            {/* Play indicator for MuscleWiki videos */}
            {!isPlaying && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                <div className="w-12 h-12 rounded-full bg-cyan-500/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        )}

        {/* Priority 3: YouTube Video Thumbnail */}
        {!hasGif && !hasMuscleWikiVideo && hasYouTubeVideo && youtubeVideoId && !hasError && (
          <div className="relative w-full h-full">
            <img
              src={thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
              alt={name}
              className="w-full h-full object-cover"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
            {/* YouTube play button overlay */}
            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="w-16 h-16 rounded-full bg-cyan-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg
                    className="w-8 h-8 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Priority 4: Thumbnail fallback */}
        {!hasGif && !hasMuscleWikiVideo && !hasYouTubeVideo && hasThumbnail && !hasError && (
          <img
            src={thumbnailUrl || undefined}
            alt={name}
            className="w-full h-full object-cover"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Priority 5: Placeholder when no media available */}
        {hasNoMedia && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <StretchIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Video coming soon
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // You can add feedback functionality here
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                Help us improve this
              </button>
            </div>
          </div>
        )}


        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Duration badge */}
        <Badge className="absolute top-3 right-3 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 backdrop-blur-sm">
          <ClockIcon className="w-3 h-3 mr-1" />
          {duration}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Stretch name */}
        <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {formatText(name)}
        </h3>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs">
          {/* Primary Muscles */}
          {displayMuscles.slice(0, 2).map((muscle, index) => (
            <span
              key={`muscle-${index}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 font-medium"
            >
              <TargetIcon className="w-3 h-3" />
              {formatText(muscle)}
            </span>
          ))}
        </div>

        {/* Brief instruction preview */}
        {instructions.length > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {instructions[0]}
          </p>
        )}
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

function StretchIcon({ className }: { className?: string }) {
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
        d="M12 4c1.5 0 3 1.5 3 3s-1.5 3-3 3-3-1.5-3-3 1.5-3 3-3zM4 20l4-4m0 0l2-6 4 2 4-6m-10 10l2 2m8-8l2 6"
      />
    </svg>
  );
}

