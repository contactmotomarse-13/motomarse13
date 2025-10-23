// lib/payment.ts - Payment configuration and utilities

// Commission configuration
export const PLATFORM_COMMISSION_PERCENT = 20 // 20% pour la plateforme, 80% pour le chauffeur

export function calculateCommission(totalAmountCents: number): {
  total: number
  platform: number
  driver: number
} {
  const platformAmount = Math.round(totalAmountCents * (PLATFORM_COMMISSION_PERCENT / 100))
  const driverAmount = totalAmountCents - platformAmount
  
  return {
    total: totalAmountCents,
    platform: platformAmount,
    driver: driverAmount,
  }
}

export function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2) + ' €'
}
