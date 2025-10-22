import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const need = ["fullName", "phone"] as const;
  for (const k of need) if (!data[k]) {
    return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_EMAIL_TO;
  const from = process.env.BOOKING_EMAIL_FROM || "Moto Marse <onboarding@resend.dev>";

  if (apiKey && to) {
    const html = `<h2>Nouvelle candidature chauffeur – Moto Marse</h2>
      <ul>
        <li><b>Nom :</b> ${data.fullName}</li>
        <li><b>Téléphone :</b> ${data.phone}</li>
        <li><b>Email :</b> ${data.email || "—"}</li>
        <li><b>Type de moto :</b> ${data.typeMoto || "—"}</li>
        <li><b>Cylindrée >125 :</b> ${data.isOver125 || "—"}</li>
        <li><b>Carte professionnelle :</b> ${data.hasProfessionalCard || "—"}</li>
        <li><b>Assurance transport :</b> ${data.hasTransportInsurance || "—"}</li>
        <li><b>Années de permis :</b> ${data.yearsLicense || "—"}</li>
        <li><b>Déjà indépendant :</b> ${data.isIndependent || "—"}</li>
        <li><b>Jours disponibles :</b> ${(data.availableDays || []).join(', ') || "—"}</li>
        <li><b>Référence :</b> ${data.referral || "—"}</li>
      </ul>
      <p><b>Message :</b><br/>${(data.message || "—")}</p>`;

    // Build attachments array if files were sent as data URLs
    const attachments: Array<{ filename: string; type: string; data: string }> = []
    try {
      const files = data.files || {}
      for (const key of Object.keys(files)) {
        const f = (files as any)[key]
        if (!f) continue
        // f expected to be an object { name, type, data }
        const name = f.name || `${key}.jpg`
        const type = f.type || 'application/octet-stream'
        let raw = f.data || ''
        // strip data:...;base64, prefix if present
        const idx = raw.indexOf('base64,')
        if (idx !== -1) raw = raw.slice(idx + 7)
        attachments.push({ filename: name, type, data: raw })
      }
    } catch (err) {
      console.warn('Attachments parse error', err)
    }

    const body: any = { from, to: [to], subject: 'Candidature chauffeur Moto Marse', html, text: html.replace(/<[^>]*>/g, '') }
    if (attachments.length) body.attachments = attachments

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Resend HTTP error:", resp.status, txt);
      return NextResponse.json({ error: "Email send failed" }, { status: 500 });
    }
  }

  console.log("Nouvelle candidature chauffeur:", data);
  return NextResponse.json({ ok: true });
}
