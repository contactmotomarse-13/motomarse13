import { NextRequest, NextResponse } from "next/server";

type NominatimReverse = {
  display_name: string
  lat: string
  lon: string
};

type Feature = { name: string; lat: number; lon: number };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) return NextResponse.json({ error: "bad_params" }, { status: 400 });

  const email = process.env.NOMINATIM_EMAIL || "contact@example.com";
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lon", lon);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "0");

  const r = await fetch(url.toString(), {
    headers: { "User-Agent": `MotoMarse/1.0 (${email})`, "Accept-Language": "fr" },
    next: { revalidate: 60 },
  });
  if (!r.ok) return NextResponse.json({ error: "nominatim_error" }, { status: r.status });

  const raw: NominatimReverse = await r.json();
  const feature: Feature = {
    name: raw.display_name,
    lat: Number(raw.lat),
    lon: Number(raw.lon),
  };
  return NextResponse.json({ feature });
}
