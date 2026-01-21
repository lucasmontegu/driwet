import { NextRequest, NextResponse } from "next/server";
import { getAlertsByPoint } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat or lon query parameters" },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: "Invalid lat or lon values" },
      { status: 400 }
    );
  }

  // Validate coordinates are within valid ranges
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      { error: "Coordinates out of valid range" },
      { status: 400 }
    );
  }

  try {
    const alerts = await getAlertsByPoint(latitude, longitude);

    return NextResponse.json({
      alerts,
      location: { latitude, longitude },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather alerts" },
      { status: 500 }
    );
  }
}
