import { Estimator } from '../../components/ui/Estimator';

const lignes = [
{ label: 'Prise en charge', price: 15 },
{ label: 'Prix / km', price: 2.2 },
{ label: 'Attente (15 min)', price: 8 },
{ label: 'Bagage (unité)', price: 3 },
]

export default function TarifsPage() {
return (
<div className="space-y-10">
<h1 className="text-3xl font-bold">Tarifs</h1>

<div className="grid gap-6 md:grid-cols-2">
<div className="card">
<h2 className="mb-4 text-lg font-semibold">Grille tarifaire</h2>
<ul className="space-y-3">
{lignes.map((l) => (
<li key={l.label} className="flex items-center justify-between">
<span className="text-white/80">{l.label}</span>
<span className="font-semibold">{l.price} €</span>
</li>
))}
</ul>
</div>
<Estimator />
</div>

<p className="text-sm text-white/60">* Prix indicatifs, soumis aux conditions de circulation et aux horaires.</p>
</div>
)
}
