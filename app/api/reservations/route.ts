import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const need = ["fullName","phone","date","time","pickup","dropoff"] as const;
  for (const k of need) if (!data[k]) {
    return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_EMAIL_TO;
  const from = process.env.BOOKING_EMAIL_FROM || "Moto Marse <onboarding@resend.dev>";

  if (apiKey && to) {
    const html = `<h2>Nouvelle réservation – Moto Marse</h2>
      <ul>
        <li><b>Nom :</b> ${data.fullName}</li>
        <li><b>Téléphone :</b> ${data.phone}</li>
        <li><b>Email :</b> ${data.email || "—"}</li>
        <li><b>Date :</b> ${data.date}</li>
        <li><b>Heure :</b> ${data.time}</li>
        <li><b>Départ :</b> ${data.pickup}</li>
        <li><b>Arrivée :</b> ${data.dropoff}</li>
        <li><b>Passagers :</b> ${data.passengers || "1"}</li>
        <li><b>Bagages :</b> ${data.luggage || "—"}</li>
      </ul>
      <p><b>Notes :</b><br/>${(data.notes || "—")}</p>`;

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

  console.log("Nouvelle réservation:", data);
  return NextResponse.json({ ok: true });
}
