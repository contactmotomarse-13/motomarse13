import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')

    if (!origin || !destination) {
      return NextResponse.json({ error: 'origin and destination required' }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      // Si pas de clé API, retourner des données par défaut (pas de majoration)
      return NextResponse.json({
        trafficRatio: 1.0,
        durationInTraffic: 0,
        durationNormal: 0,
        distance: 0,
        trafficLevel: 'Trafic fluide',
        surcharge: 0,
      })
    }

    // Call Google Maps Distance Matrix API with traffic data
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json')
    url.searchParams.set('origins', origin)
    url.searchParams.set('destinations', destination)
    url.searchParams.set('mode', 'driving')
    url.searchParams.set('departure_time', 'now') // Pour obtenir duration_in_traffic
    url.searchParams.set('traffic_model', 'best_guess')
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      return NextResponse.json({ error: 'Unable to get traffic data' }, { status: 500 })
    }

    const element = data.rows[0].elements[0]
    if (element.status !== 'OK') {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 })
    }

    const durationInTraffic = element.duration_in_traffic?.value || element.duration.value // en secondes
    const durationNormal = element.duration.value // en secondes
    const distance = element.distance.value // en mètres

    // Calculer le ratio trafic
    const trafficRatio = durationInTraffic / durationNormal

    // Déterminer la majoration selon le ratio
    let surcharge = 0
    let trafficLevel = 'Trafic fluide'

    if (trafficRatio >= 1.5) {
      surcharge = 0.30
      trafficLevel = 'Trafic très dense'
    } else if (trafficRatio >= 1.3) {
      surcharge = 0.20
      trafficLevel = 'Trafic dense'
    } else if (trafficRatio >= 1.15) {
      surcharge = 0.10
      trafficLevel = 'Trafic modéré'
    }

    return NextResponse.json({
      trafficRatio,
      durationInTraffic, // en secondes
      durationNormal, // en secondes
      distance, // en mètres
      trafficLevel,
      surcharge,
    })
  } catch (error) {
    console.error('Traffic API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
