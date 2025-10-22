import Link from 'next/link'
import { Estimator } from '../components/ui/Estimator'



export default function Page() {
return (
<div className="space-y-10">
<section className="relative text-center py-20">
<div className="absolute inset-0 -z-10 bg-[url('/marseille-port.jpg')] bg-cover bg-bottom opacity-20" />
<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Moto‑Taxi à Marseille 🏍️ </h1>
<p className="mt-4 text-white/80 max-w-2xl mx-auto">
Gagne du temps, évite les bouchons. Tarifs clairs, réservation simple, prise en charge rapide.
</p>
<div className="mt-6 flex items-center justify-center gap-3">
<Link href="/reserver" className="btn btn-primary">Réserver maintenant</Link>
<Link href="/tarifs" className="btn btn-outline">Voir les tarifs</Link>
</div>
</section>

<Estimator />

<section className="grid gap-6 md:grid-cols-3">
{[
{title: 'Rapide', desc: 'Coupe‑file trafic et arrivée à l’heure.'},
{title: 'Sûr', desc: 'Pilotes pros, équipement fourni.'},
{title: 'Transparent', desc: 'Prix annoncé avant le départ.'},
].map((f) => (
<div key={f.title} className="card">
<h3 className="font-semibold mb-2">{f.title}</h3>
<p className="text-white/80 text-sm">{f.desc}</p>
</div>
))}
</section>

<section className="grid gap-4 md:grid-cols-3">
	<div className="rounded-xl overflow-hidden h-48 md:h-64 lg:h-80">
		<img 
			src="/ray-battuta-b1W0d_YXobI-unsplash.jpg" 
			alt="Marseille vue 1" 
			className="w-full h-full object-cover"
		/>
	</div>
	<div className="rounded-xl overflow-hidden h-48 md:h-64 lg:h-80">
		<img 
			src="/lara-schipperen-MoXjkju1BHg-unsplash.jpg" 
			alt="Marseille vue 2" 
			className="w-full h-full object-cover"
		/>
	</div>
	<div className="rounded-xl overflow-hidden h-48 md:h-64 lg:h-80">
		<img 
			src="/guilherme-gobert-St0K4DW5qJY-unsplash.jpg" 
			alt="Marseille vue 3" 
			className="w-full h-full object-cover"
		/>
	</div>
</section>
</div>
)
}
