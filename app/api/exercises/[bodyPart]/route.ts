import { NextRequest, NextResponse } from "next/server";

interface ExerciseAPIResponse {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bodyPart: string }> }
) {
  try {
    const { bodyPart } = await params;

    if (!bodyPart) {
      return NextResponse.json(
        { error: "Body part is required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(
        bodyPart
      )}?limit=50`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host":
            process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) {
      console.error("ExerciseDB API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch exercises from ExerciseDB" },
        { status: res.status }
      );
    }

    const exercises: ExerciseAPIResponse[] = await res.json();

    // Add gifUrl to each exercise using our local proxy API
    const exercisesWithGifs = exercises.map((exercise) => ({
      ...exercise,
      gifUrl: `/api/exercises/image/${exercise.id}`,
    }));

    return NextResponse.json(exercisesWithGifs);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
