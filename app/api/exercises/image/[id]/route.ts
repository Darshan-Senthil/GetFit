import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Exercise ID is required" },
        { status: 400 }
      );
    }

    // Fetch image from ExerciseDB API
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/image/${id}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host":
            process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) {
      console.error("ExerciseDB Image API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: res.status }
      );
    }

    // Get the image data
    const imageBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/gif";

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error fetching exercise image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

