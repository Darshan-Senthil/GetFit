import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MUSCLE_IDS } from "@/lib/musclewiki";

interface FilterParams {
  ageGroup: string;
  gender: string;
  muscleGroup?: string;
  goal?: string;
  equipment?: string;
  type: "workout" | "stretch";
}

interface ExerciseResult {
  id: string;
  name: string;
  target: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  gifUrl?: string | null;
  instructions: string[];
  tags: string[];
  source: "musclewiki" | "ai";
}

export async function POST(request: NextRequest) {
  try {
    const filters: FilterParams = await request.json();

    if (!filters.ageGroup || !filters.gender || !filters.type) {
      return NextResponse.json(
        { error: "Age group, gender, and type are required" },
        { status: 400 }
      );
    }

    // Try to fetch from MuscleWiki first if muscle group is specified
    let muscleWikiExercises: ExerciseResult[] = [];

    if (filters.muscleGroup && filters.type === "workout") {
      const muscleId = MUSCLE_IDS[filters.muscleGroup.toLowerCase()];

      if (muscleId) {
        try {
          const res = await fetch(
            `https://musclewiki.com/newapi/exercise/exercises/?muscles_primary=${muscleId}&limit=20`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
              next: { revalidate: 3600 },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const exercisesWithVideos = await Promise.allSettled(
              data.results
                .filter((ex: any) => ex.name) // Filter out exercises without names
                .map(async (ex: any) => {
                  try {
                    const videoUrl =
                      filters.gender === "female"
                        ? ex.female_images[0]?.unbranded_video ||
                          ex.male_images[0]?.unbranded_video ||
                          null
                        : ex.male_images[0]?.unbranded_video ||
                          ex.female_images[0]?.unbranded_video ||
                          null;

                    // Try to validate video, but include exercise even if validation fails
                    let hasValidVideo = false;
                    if (videoUrl) {
                      try {
                        hasValidVideo = await validateVideoUrl(videoUrl);
                      } catch (error) {
                        // If validation fails, still include the exercise
                        hasValidVideo = false;
                      }
                    }

                    // Include exercise even without video - we'll show placeholder

                    return {
                      id: `mw-${ex.id}`,
                      name: ex.name || "Exercise",
                      target: ex.muscles_primary[0]?.name || "Unknown",
                      primaryMuscles: ex.muscles_primary.map(
                        (m: any) => m.name
                      ),
                      secondaryMuscles: ex.muscles_secondary.map(
                        (m: any) => m.name
                      ),
                      equipment: ex.category?.name || "Bodyweight",
                      difficulty: ex.difficulty?.name || "Intermediate",
                      videoUrl: hasValidVideo ? videoUrl : null,
                      thumbnailUrl: hasValidVideo
                        ? filters.gender === "female"
                          ? ex.female_images[0]?.og_image ||
                            ex.male_images[0]?.og_image ||
                            null
                          : ex.male_images[0]?.og_image ||
                            ex.female_images[0]?.og_image ||
                            null
                        : null,
                      instructions:
                        ex.correct_steps
                          ?.sort((a: any, b: any) => a.order - b.order)
                          .map((s: any) => s.text) || [],
                      tags: getTagsForExercise(ex, filters),
                      source: "musclewiki" as const,
                    };
                  } catch (error) {
                    console.error(`Error validating exercise ${ex.id}:`, error);
                    return null;
                  }
                })
            );

            muscleWikiExercises = exercisesWithVideos
              .filter(
                (
                  result
                ): result is PromiseFulfilledResult<ExerciseResult | null> =>
                  result.status === "fulfilled" && result.value !== null
              )
              .map((result) => result.value as ExerciseResult);
          }
        } catch (error) {
          console.error("MuscleWiki fetch error:", error);
        }
      }
    }

    // Limit MuscleWiki results to 8 max
    const limitedMuscleWikiExercises = muscleWikiExercises.slice(0, 8);

    // If we have 5+ MuscleWiki results, return them (limited to 8)
    if (limitedMuscleWikiExercises.length >= 5) {
      return NextResponse.json({
        exercises: limitedMuscleWikiExercises,
        source: "musclewiki",
        count: limitedMuscleWikiExercises.length,
      });
    }

    // Fallback to AI if MuscleWiki doesn't have enough results or isn't available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Initialize OpenAI client lazily (only when needed, not at module level)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const aiPrompt = buildAIPrompt(filters);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a certified fitness expert who provides personalized ${filters.type} recommendations. Always respond with valid JSON only, no markdown formatting.`,
        },
        {
          role: "user",
          content: aiPrompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);

    // Helper function to extract YouTube video ID
    const getYouTubeVideoId = (
      url: string | null | undefined
    ): string | null => {
      if (!url) return null;
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    // Helper function to generate YouTube thumbnail
    const getYouTubeThumbnail = (
      url: string | null | undefined
    ): string | null => {
      const videoId = getYouTubeVideoId(url);
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    };

    // Helper function to validate if a video URL is accessible
    const validateVideoUrl = async (
      url: string | null | undefined
    ): Promise<boolean> => {
      if (!url) return false;

      // Check if it's a YouTube URL
      const youtubeVideoId = getYouTubeVideoId(url);
      if (youtubeVideoId) {
        // Validate YouTube video by checking if thumbnail is accessible
        // YouTube video IDs are 11 characters, alphanumeric + hyphens/underscores
        if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeVideoId)) {
          return false;
        }

        try {
          // Check multiple thumbnail sizes to ensure video exists
          const thumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/mqdefault.jpg`;
          const response = await fetch(thumbnailUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(3000), // 3 second timeout
          });

          if (!response.ok) return false;

          // Check content-length - unavailable videos often have very small thumbnails
          const contentLength = response.headers.get("content-length");
          if (contentLength) {
            const size = parseInt(contentLength);
            // Valid YouTube thumbnails are typically > 5KB
            return size > 5000;
          }

          return true;
        } catch {
          return false;
        }
      }

      // For non-YouTube URLs (MP4, etc.), check if URL is accessible
      try {
        const response = await fetch(url, {
          method: "HEAD",
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        return response.ok;
      } catch {
        return false;
      }
    };

    // Validate and filter AI exercises to only include those with valid video URLs
    const aiExercisesWithValidation = await Promise.allSettled(
      (parsed.exercises || parsed.results || []).map(
        async (ex: any, idx: number) => {
          try {
            const videoUrl = ex.videoUrl || ex.video || null;

            // Try to validate video, but include exercise even if validation fails
            let hasValidVideo = false;
            if (videoUrl) {
              try {
                hasValidVideo = await validateVideoUrl(videoUrl);
              } catch (error) {
                // If validation fails, still include the exercise
                hasValidVideo = false;
              }
            }

            // Only reject if name is missing - allow exercises without videos or equipment
            if (!ex.name) return null;

            // For stretches, equipment can be "None"
            const equipmentValue =
              ex.equipment ||
              filters.equipment ||
              (filters.type === "stretch" ? "None" : "Bodyweight");
            const youtubeThumbnail = hasValidVideo
              ? getYouTubeThumbnail(videoUrl)
              : null;

            return {
              id: `ai-${Date.now()}-${idx}`,
              name: ex.name || ex.title || "Exercise",
              target:
                ex.target ||
                ex.muscleGroup ||
                filters.muscleGroup ||
                "Full Body",
              primaryMuscles: ex.primaryMuscles || [
                ex.target || filters.muscleGroup || "Full Body",
              ],
              secondaryMuscles: ex.secondaryMuscles || [],
              equipment: equipmentValue,
              difficulty: ex.difficulty || "Intermediate",
              videoUrl: hasValidVideo ? videoUrl : null,
              thumbnailUrl: hasValidVideo
                ? ex.thumbnailUrl || ex.thumbnail || youtubeThumbnail || null
                : null,
              gifUrl: ex.gifUrl || ex.gif || null,
              instructions: ex.instructions || ex.steps || [],
              tags: ex.tags || getAITags(filters),
              source: "ai" as const,
            };
          } catch (error) {
            console.error(`Error validating AI exercise ${idx}:`, error);
            return null;
          }
        }
      )
    );

    const aiExercises: ExerciseResult[] = aiExercisesWithValidation
      .filter(
        (result): result is PromiseFulfilledResult<ExerciseResult | null> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value as ExerciseResult);

    // Combine MuscleWiki and AI results
    let allExercises = [...limitedMuscleWikiExercises, ...aiExercises];

    // Ensure we return 5-8 exercises
    // If we have less than 5, return what we have (minimum 1)
    // If we have more than 8, limit to 8
    const finalCount = Math.min(8, Math.max(1, allExercises.length));
    const finalExercises = allExercises.slice(0, finalCount);

    return NextResponse.json({
      exercises: finalExercises,
      source: limitedMuscleWikiExercises.length > 0 ? "mixed" : "ai",
      count: finalExercises.length,
    });
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    return NextResponse.json(
      { error: "Failed to generate fitness plan" },
      { status: 500 }
    );
  }
}

function getTagsForExercise(ex: any, filters: FilterParams): string[] {
  const tags: string[] = [];

  if (
    filters.ageGroup?.includes("Senior") ||
    filters.ageGroup?.includes("60+")
  ) {
    tags.push("Low Impact", "Joint Friendly");
  }

  if (ex.difficulty?.name === "Beginner") {
    tags.push("Beginner Friendly");
  }

  if (ex.category?.name === "Bodyweight" || !ex.category) {
    tags.push("No Equipment");
  }

  return tags;
}

function getAITags(filters: FilterParams): string[] {
  const tags: string[] = [];

  if (
    filters.ageGroup?.includes("Senior") ||
    filters.ageGroup?.includes("60+")
  ) {
    tags.push("Low Impact", "Joint Friendly");
  }

  if (filters.goal?.toLowerCase().includes("beginner")) {
    tags.push("Beginner Friendly");
  }

  if (
    filters.equipment?.toLowerCase().includes("bodyweight") ||
    !filters.equipment
  ) {
    tags.push("No Equipment");
  }

  return tags;
}

function buildAIPrompt(filters: FilterParams): string {
  const ageContext = getAgeContext(filters.ageGroup);
  const goalContext = filters.goal ? `Goal: ${filters.goal}. ` : "";
  const equipmentContext = filters.equipment
    ? `Equipment available: ${filters.equipment}. `
    : "";
  const muscleContext = filters.muscleGroup
    ? `Focus on: ${filters.muscleGroup}. `
    : "";

  if (filters.type === "workout") {
    return `Generate exactly 5-8 personalized workout exercises for a ${filters.ageGroup} ${filters.gender}. ${ageContext}${goalContext}${equipmentContext}${muscleContext}

Output format as JSON:
{
  "exercises": [
    {
      "name": "Exercise Name",
      "target": "Primary muscle group",
      "primaryMuscles": ["muscle1", "muscle2"],
      "secondaryMuscles": ["muscle3"],
      "equipment": "Equipment needed",
      "difficulty": "Beginner/Intermediate/Advanced",
      "videoUrl": "YouTube URL if available",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "tags": ["Low Impact", "Joint Friendly"]
    }
  ]
}

Requirements:
- Exercises should be age-appropriate and safe
- Include clear, numbered instructions
- ONLY provide YouTube video URLs that are publicly available and accessible
- Do NOT include placeholder URLs or unavailable video links
- If you cannot find a valid YouTube video URL for an exercise, omit the videoUrl field (set to null)
- Add relevant tags (Low Impact, Joint Friendly, Beginner Friendly, etc.)
- Respect equipment constraints
- Focus on the specified muscle group if provided
- Return ONLY valid JSON, no markdown formatting`;
  } else {
    return `Generate exactly 5-8 personalized stretching exercises for a ${filters.ageGroup} ${filters.gender}. ${ageContext}${goalContext}${equipmentContext}${muscleContext}

Output format as JSON:
{
  "exercises": [
    {
      "name": "Stretch Name",
      "target": "Primary muscle group",
      "primaryMuscles": ["muscle1", "muscle2"],
      "secondaryMuscles": ["muscle3"],
      "equipment": "None or minimal",
      "difficulty": "Beginner/Intermediate/Advanced",
      "videoUrl": "YouTube URL if available",
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "tags": ["Low Impact", "Joint Friendly"],
      "duration": "30 seconds"
    }
  ]
}

Requirements:
- Stretches should be age-appropriate and safe
- Include clear, numbered instructions
- ONLY provide YouTube video URLs that are publicly available and accessible
- Do NOT include placeholder URLs or unavailable video links
- If you cannot find a valid YouTube video URL for a stretch, omit the videoUrl field (set to null)
- Add relevant tags
- Specify duration for each stretch
- Return ONLY valid JSON, no markdown formatting`;
  }
}

function getAgeContext(ageGroup: string): string {
  if (ageGroup.includes("Teen") || ageGroup.includes("13-17")) {
    return "Focus on safe, form-focused exercises suitable for growing bodies. ";
  }
  if (ageGroup.includes("Young Adult") || ageGroup.includes("18-30")) {
    return "Can include moderate to high intensity exercises. ";
  }
  if (ageGroup.includes("Adult") || ageGroup.includes("31-50")) {
    return "Focus on sustainable, joint-friendly movements. ";
  }
  if (
    ageGroup.includes("Senior") ||
    ageGroup.includes("50+") ||
    ageGroup.includes("60+")
  ) {
    return "Prioritize low-impact, joint-friendly exercises. Avoid high-impact movements. Focus on balance and mobility. ";
  }
  return "";
}
