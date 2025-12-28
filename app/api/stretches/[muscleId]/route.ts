import { NextRequest, NextResponse } from "next/server";
import { MuscleWikiResponse } from "@/lib/musclewiki";

// Category ID for Stretches in MuscleWiki
const STRETCHES_CATEGORY_ID = 8;

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

    // Fetch stretches from MuscleWiki API (category=8 is Stretches)
    const res = await fetch(
      `https://musclewiki.com/newapi/exercise/exercises/?category=${STRETCHES_CATEGORY_ID}&muscles_primary=${muscleId}&limit=30`,
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
        { error: "Failed to fetch stretches from MuscleWiki" },
        { status: res.status }
      );
    }

    const data: MuscleWikiResponse = await res.json();

    // Transform to detailed format for frontend
    // We'll categorize stretches as pre/post workout based on name patterns
    const stretches = data.results.map((ex) => {
      // Determine if it's more suitable for pre or post workout
      // Dynamic stretches (movement-based) = pre-workout
      // Static stretches (hold positions) = post-workout
      const nameLower = ex.name.toLowerCase();
      const isPreWorkout =
        nameLower.includes("dynamic") ||
        nameLower.includes("swing") ||
        nameLower.includes("circle") ||
        nameLower.includes("rotation") ||
        nameLower.includes("arm circles") ||
        nameLower.includes("leg swing");

      // Estimate duration based on stretch type
      const duration = isPreWorkout ? "30-60 seconds" : "20-30 seconds";

      return {
        id: ex.id,
        name: ex.name,
        target: ex.muscles_primary[0]?.name || "Unknown",
        primaryMuscles: ex.muscles_primary.map((m) => m.name),
        secondaryMuscles: ex.muscles_secondary.map((m) => m.name),
        videoUrl: ex.male_images[0]?.unbranded_video || null,
        thumbnailUrl: ex.male_images[0]?.og_image || null,
        instructions: ex.correct_steps
          ?.sort((a, b) => a.order - b.order)
          .map((s) => s.text) || [],
        duration,
        type: isPreWorkout ? "pre" : "post",
      };
    });

    // Separate into pre and post workout
    const preWorkout = stretches.filter((s) => s.type === "pre");
    const postWorkout = stretches.filter((s) => s.type === "post");

    // If we don't have enough in one category, balance them
    // Most stretches will be "post" (static), so let's split evenly if needed
    if (preWorkout.length === 0 && postWorkout.length > 0) {
      const half = Math.ceil(postWorkout.length / 2);
      return NextResponse.json({
        count: data.count,
        preWorkout: postWorkout.slice(0, half).map((s) => ({
          ...s,
          type: "pre",
          duration: "30-60 seconds",
        })),
        postWorkout: postWorkout.slice(half),
      });
    }

    return NextResponse.json({
      count: data.count,
      preWorkout,
      postWorkout,
    });
  } catch (error) {
    console.error("Error fetching stretches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

