import { NextRequest, NextResponse } from "next/server";
import { MuscleWikiResponse } from "@/lib/musclewiki";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ muscleId: string }> }
) {
  try {
    const { muscleId } = await params;

    if (!muscleId) {
      return NextResponse.json(
        { error: "Muscle ID is required" },
        { status: 400 }
      );
    }

    // Fetch from MuscleWiki API
    const res = await fetch(
      `https://musclewiki.com/newapi/exercise/exercises/?muscles_primary=${muscleId}&limit=20`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      console.error("MuscleWiki API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch exercises from MuscleWiki" },
        { status: res.status }
      );
    }

    const data: MuscleWikiResponse = await res.json();

    // Transform to detailed format for frontend
    const exercises = data.results.map((ex) => ({
      id: ex.id,
      name: ex.name,
      // Target muscles
      target: ex.muscles_primary[0]?.name || "Unknown",
      primaryMuscles: ex.muscles_primary.map((m) => m.name),
      secondaryMuscles: ex.muscles_secondary.map((m) => m.name),
      // Equipment & difficulty
      equipment: ex.category?.name || "Bodyweight",
      difficulty: ex.difficulty?.name || "Intermediate",
      // Media
      videoUrl: ex.male_images[0]?.unbranded_video || null,
      thumbnailUrl: ex.male_images[0]?.og_image || null,
      // Instructions
      instructions:
        ex.correct_steps
          ?.sort((a, b) => a.order - b.order)
          .map((s) => s.text) || [],
    }));

    return NextResponse.json({
      count: data.count,
      exercises,
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
