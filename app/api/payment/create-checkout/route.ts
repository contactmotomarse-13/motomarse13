import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { getBookingById } from '@/lib/db'
import { calculateCommission } from '@/lib/payment'

// Initialize Stripe only if key exists (prevents build errors)
const stripeKey = process.env.STRIPE_SECRET_KEY
if (!stripeKey) {
  console.warn('STRIPE_SECRET_KEY not configured')
}
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-09-30.clover',
}) : null

export async function POST(req: Request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ error: 'Paiement non configuré' }, { status: 500 })
    }

    const { bookingId, amount } = await req.json()

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'bookingId et amount requis' }, { status: 400 })
    }

    // Verify user is logged in
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Vous devez être connecté pour payer' }, { status: 401 })
    }

    // Verify booking exists and belongs to user
    const booking = getBookingById(bookingId)
    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    if (booking.userId !== user.id) {
      return NextResponse.json({ error: 'Cette réservation ne vous appartient pas' }, { status: 403 })
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Cette réservation est déjà payée' }, { status: 400 })
    }

    // Calculate commission
    const amountCents = Math.round(amount * 100) // Convert euros to cents
    const commission = calculateCommission(amountCents)

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Trajet Moto Marse',
              description: `${booking.pickup} → ${booking.dropoff}\n${booking.date} à ${booking.time}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/profil?payment=success&booking=${bookingId}`,
      cancel_url: `${req.headers.get('origin')}/profil?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        bookingId,
        userId: user.id,
        amountTotal: commission.total.toString(),
        amountPlatform: commission.platform.toString(),
        amountDriver: commission.driver.toString(),
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du paiement' },
      { status: 500 }
    )
  }
}
