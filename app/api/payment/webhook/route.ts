import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getBookings, saveBookings } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const bookingId = session.metadata?.bookingId
      if (!bookingId) {
        console.error('No bookingId in session metadata')
        return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
      }

      // Update booking with payment info
      const bookings = getBookings()
      const bookingIndex = bookings.findIndex((b) => b.id === bookingId)

      if (bookingIndex === -1) {
        console.error('Booking not found:', bookingId)
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      bookings[bookingIndex] = {
        ...bookings[bookingIndex],
        paymentStatus: 'paid',
        paymentIntentId: session.payment_intent as string,
        amountTotal: parseInt(session.metadata?.amountTotal || '0'),
        amountPlatform: parseInt(session.metadata?.amountPlatform || '0'),
        amountDriver: parseInt(session.metadata?.amountDriver || '0'),
        paidAt: new Date().toISOString(),
        status: 'confirmed', // Auto-confirm when paid
      }

      saveBookings(bookings)

      console.log('Payment confirmed for booking:', bookingId)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
