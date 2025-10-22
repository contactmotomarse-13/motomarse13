'use client'
import { useEffect, useRef, useState } from 'react'

type FilePayload = { name: string; type: string; data: string }

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(String(reader.result))
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

export default function DevenirPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  // form fields (matching Google Form)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [typeMoto, setTypeMoto] = useState('') // modèle et année
  const [isOver125, setIsOver125] = useState<'Oui'|'Non'|''>('')
  const [hasProfessionalCard, setHasProfessionalCard] = useState<'Oui'|'Non'|'En cours d\'obtention'|''>('')
  const [hasTransportInsurance, setHasTransportInsurance] = useState<'Oui'|'Non'|'En cours'|''>('')
  const [yearsLicense, setYearsLicense] = useState('')
  const [isIndependent, setIsIndependent] = useState<'Oui'|'Non'|''>('')
  const [availableDays, setAvailableDays] = useState<string[]>([])
  const [referral, setReferral] = useState<'Réseaux sociaux'|'Ami'|'Internet'|'Autre'|''>('')
  const [message, setMessage] = useState('')

  // files as base64 payloads
  const [permis, setPermis] = useState<FilePayload | null>(null)
  const [certificat, setCertificat] = useState<FilePayload | null>(null)
  const [certificatAssurance, setCertificatAssurance] = useState<FilePayload | null>(null)
  const [motoPhoto, setMotoPhoto] = useState<FilePayload | null>(null)

  // head photo captured live (dataURL)
  const [headPhoto, setHeadPhoto] = useState<FilePayload | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) videoRef.current.srcObject = stream
      await videoRef.current?.play()
    } catch (err) {
      console.error('Camera error', err)
      setError('Impossible d\'accéder à la caméra')
    }
  }

  function captureHeadPhoto() {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current!
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setHeadPhoto({ name: 'head.jpg', type: 'image/jpeg', data: dataUrl })
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, setter: (p: FilePayload | null) => void) {
    const f = e.target.files?.[0]
    if (!f) return setter(null)
    const dataUrl = await toBase64(f)
    setter({ name: f.name, type: f.type, data: dataUrl })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fullName || !phone) return setError('Nom et téléphone requis')
    if (!headPhoto) return setError('Photo de la tête requise (prise en direct)')
    setLoading(true)

    const payload = {
      fullName,
      phone,
      email,
      typeMoto,
      isOver125,
      hasProfessionalCard,
      hasTransportInsurance,
      yearsLicense,
      isIndependent,
      availableDays,
      referral,
      message,
      files: {
        permis,
        certificat,
  certificatAssurance,
        motoPhoto,
        headPhoto,
      },
    }

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Erreur serveur')
      }
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold">Merci — candidature reçue</h1>
      <p>Nous reviendrons vers vous rapidement.</p>
    </div>
  )

  return (
    <div className="container py-12">
      <h1 className="text-2xl font-bold">Devenir chauffeur</h1>
      <p className="text-white/80 mt-2">Remplissez le formulaire ci‑dessous et notre équipe vous contactera.</p>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 max-w-2xl">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Nom complet *</span>
          <input value={fullName} onChange={e => setFullName(e.target.value)} name="fullName" required className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Téléphone *</span>
          <input value={phone} onChange={e => setPhone(e.target.value)} name="phone" type="tel" required className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} name="email" type="email" className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        {/* Expérience field removed (not used) */}

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Type de moto (modèle et année)</span>
          <input value={typeMoto} onChange={e => setTypeMoto(e.target.value)} name="typeMoto" placeholder="Ex: Yamaha MT-07 2020" className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Votre moto a-t-elle une cylindrée supérieure à 125 cm³ ?</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2"><input type="radio" name="isOver125" value="Oui" checked={isOver125==='Oui'} onChange={() => setIsOver125('Oui')} /> Oui</label>
            <label className="flex items-center gap-2"><input type="radio" name="isOver125" value="Non" checked={isOver125==='Non'} onChange={() => setIsOver125('Non')} /> Non</label>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Possédez-vous une carte professionnelle de transport de personnes à moto ?</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2"><input type="radio" name="hasProfessionalCard" value="Oui" checked={hasProfessionalCard==='Oui'} onChange={() => setHasProfessionalCard('Oui')} /> Oui</label>
            <label className="flex items-center gap-2"><input type="radio" name="hasProfessionalCard" value="Non" checked={hasProfessionalCard==='Non'} onChange={() => setHasProfessionalCard('Non')} /> Non</label>
            <label className="flex items-center gap-2"><input type="radio" name="hasProfessionalCard" value="En cours d'obtention" checked={hasProfessionalCard==="En cours d'obtention"} onChange={() => setHasProfessionalCard("En cours d'obtention")} /> En cours d'obtention</label>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Avez-vous une assurance spécifique pour le transport de personnes ?</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2"><input type="radio" name="hasTransportInsurance" value="Oui" checked={hasTransportInsurance==='Oui'} onChange={() => setHasTransportInsurance('Oui')} /> Oui</label>
            <label className="flex items-center gap-2"><input type="radio" name="hasTransportInsurance" value="Non" checked={hasTransportInsurance==='Non'} onChange={() => setHasTransportInsurance('Non')} /> Non</label>
            <label className="flex items-center gap-2"><input type="radio" name="hasTransportInsurance" value="En cours" checked={hasTransportInsurance==='En cours'} onChange={() => setHasTransportInsurance('En cours')} /> En cours</label>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Depuis combien d’années avez-vous votre permis moto (A ou A2) ?</span>
          <input value={yearsLicense} onChange={e => setYearsLicense(e.target.value)} name="yearsLicense" type="number" min={0} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Êtes-vous déjà chauffeur indépendant (VTC, livraison, taxi...) ?</span>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2"><input type="radio" name="isIndependent" value="Oui" checked={isIndependent==='Oui'} onChange={() => setIsIndependent('Oui')} /> Oui</label>
            <label className="flex items-center gap-2"><input type="radio" name="isIndependent" value="Non" checked={isIndependent==='Non'} onChange={() => setIsIndependent('Non')} /> Non</label>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Quels jours êtes-vous disponible pour rouler ? (cochez)</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'].map(d => (
              <label key={d} className="flex items-center gap-2"><input type="checkbox" value={d} checked={availableDays.includes(d)} onChange={e => {
                const v = e.currentTarget.value
                setAvailableDays(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v])
              }} /> {d}</label>
            ))}
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Comment avez-vous entendu parler de MotoMarse ?</span>
          <select value={referral} onChange={e=>setReferral(e.target.value as any)} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20">
            <option value="">-- Choisir --</option>
            <option>Réseaux sociaux</option>
            <option>Ami</option>
            <option>Internet</option>
            <option>Autre</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Message</span>
          <textarea value={message} onChange={e => setMessage(e.target.value)} name="message" rows={4} className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Permis de conduire (photo)</span>
            <input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, setPermis)} />
            {permis && <span className="text-sm text-white/70">{permis.name}</span>}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Certificat d'immatriculation</span>
            <input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, setCertificat)} />
            {certificat && <span className="text-sm text-white/70">{certificat.name}</span>}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Certificat d'assurance</span>
            <input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, setCertificatAssurance)} />
            {certificatAssurance && <span className="text-sm text-white/70">{certificatAssurance.name}</span>}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-white/70">Photo de la moto</span>
            <input type="file" accept="image/*" onChange={e => handleFileInput(e, setMotoPhoto)} />
            {motoPhoto && <span className="text-sm text-white/70">{motoPhoto.name}</span>}
          </label>
        </div>

        <div className="border-t border-white/10 pt-4">
          <h3 className="font-semibold">Photo de la tête (prise en direct) *</h3>
          <p className="text-sm text-white/70">La photo doit être prise maintenant avec la webcam — pas d'upload depuis fichier.</p>
          <div className="mt-3 flex flex-col gap-2">
            <video ref={videoRef} className="rounded bg-black" style={{ width: 320, height: 240 }} />
            <div className="flex gap-2">
              <button type="button" onClick={startCamera} className="btn">Démarrer la caméra</button>
              <button type="button" onClick={captureHeadPhoto} className="btn">Prendre la photo</button>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {headPhoto && (
              <div className="mt-2">
                <img src={headPhoto.data} alt="head" className="w-40 h-40 object-cover rounded-full" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer candidature'}</button>
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      </form>
    </div>
  )
}
