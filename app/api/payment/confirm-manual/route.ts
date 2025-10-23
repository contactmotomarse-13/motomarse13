import { NextRequest, NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/lib/db';
import { calculateCommission } from '@/lib/payment';

// Route temporaire pour confirmer manuellement un paiement
export async function POST(request: NextRequest) {
  try {
    const { bookingId, amount } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requis' }, { status: 400 });
    }

    const bookings = getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 });
    }

    // Calculate commission if amount provided
    let commission = null;
    if (amount) {
      const amountCents = Math.round(amount * 100);
      commission = calculateCommission(amountCents);
    }

    // Mettre à jour le statut de paiement
    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      paymentStatus: 'paid',
      status: 'confirmed',
      paidAt: new Date().toISOString(),
      ...(commission && {
        amountTotal: commission.total,
        amountPlatform: commission.platform,
        amountDriver: commission.driver,
      }),
    };

    saveBookings(bookings);

    return NextResponse.json({ 
      success: true, 
      message: 'Paiement confirmé manuellement',
      booking: bookings[bookingIndex]
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
