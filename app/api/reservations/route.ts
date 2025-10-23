import { NextResponse } from "next/server";
import { VEHICLE_CATEGORIES } from "@/config/pricing";
import { getCurrentUser } from "@/lib/auth";
import { createBooking } from "@/lib/db";
import type { Booking } from "@/lib/db";

export async function POST(req: Request) {
  const data = await req.json();
  const need = ["fullName","phone","date","time","pickup","dropoff"] as const;
  for (const k of need) if (!data[k]) {
    return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }

  // Check if user is logged in
  const user = await getCurrentUser();

  // Get vehicle category name
  const vehicleCat = VEHICLE_CATEGORIES.find(v => v.id === data.vehicleCategory);
  const vehicleName = vehicleCat ? vehicleCat.name : data.vehicleCategory || "Non spécifié";

  // Create booking in database
  const booking: Booking = {
    id: `booking_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    userId: user?.id,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    vehicleCategory: data.vehicleCategory || 'standard',
    date: data.date,
    time: data.time,
    pickup: data.pickup,
    dropoff: data.dropoff,
    passengers: data.passengers,
    luggage: data.luggage,
    notes: data.notes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  createBooking(booking);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_EMAIL_TO;
  const from = process.env.BOOKING_EMAIL_FROM || "Moto Marse <onboarding@resend.dev>";

  if (apiKey && to) {
    const html = `<h2>Nouvelle réservation – Moto Marse</h2>
      <ul>
        <li><b>Nom :</b> ${data.fullName}</li>
        <li><b>Téléphone :</b> ${data.phone}</li>
        <li><b>Email :</b> ${data.email || "—"}</li>
        <li><b>Catégorie de véhicule :</b> ${vehicleName}</li>
        <li><b>Date :</b> ${data.date}</li>
        <li><b>Heure :</b> ${data.time}</li>
        <li><b>Départ :</b> ${data.pickup}</li>
        <li><b>Arrivée :</b> ${data.dropoff}</li>
        <li><b>Passagers :</b> ${data.passengers || "1"}</li>
        <li><b>Bagages :</b> ${data.luggage || "—"}</li>
        ${user ? `<li><b>Compte utilisateur :</b> ${user.email}</li>` : ''}
      </ul>
      <p><b>Notes :</b><br/>${(data.notes || "—")}</p>
      <p><b>ID Réservation :</b> ${booking.id}</p>`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: "Nouvelle réservation Moto Marse", html, text: html.replace(/<[^>]*>/g, "") }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Resend HTTP error:", resp.status, txt);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }
  }

  console.log("Nouvelle réservation:", booking);
  return NextResponse.json({ 
    ok: true, 
    bookingId: booking.id,
    needsAuth: !user, // Indicate if user needs to login
    userId: user?.id,
  });
}
