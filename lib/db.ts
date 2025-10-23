// lib/db.ts - Simple JSON file database (replace with real DB later)
import fs from 'fs'
import path from 'path'
import type { UserWithPassword, User } from './auth'

const DB_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DB_DIR, 'users.json')
const BOOKINGS_FILE = path.join(DB_DIR, 'bookings.json')

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]))
}
if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([]))
}

export type Booking = {
  id: string
  userId?: string
  driverId?: string
  fullName: string
  phone: string
  email?: string
  vehicleCategory: string
  date: string
  time: string
  pickup: string
  dropoff: string
  passengers?: string
  luggage?: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  // Payment info
  paymentStatus?: 'unpaid' | 'paid' | 'refunded'
  paymentIntentId?: string
  amountTotal?: number // en centimes (euros * 100)
  amountDriver?: number // commission chauffeur en centimes
  amountPlatform?: number // commission plateforme en centimes
  paidAt?: string
}

// Users CRUD
export function getUsers(): UserWithPassword[] {
  const data = fs.readFileSync(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function saveUsers(users: UserWithPassword[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
}

export function getUserByEmail(email: string): UserWithPassword | null {
  const users = getUsers()
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null
}

export function getUserById(id: string): UserWithPassword | null {
  const users = getUsers()
  return users.find(u => u.id === id) || null
}

export function createUser(user: UserWithPassword): User {
  const users = getUsers()
  users.push(user)
  saveUsers(users)
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

// Bookings CRUD
export function getBookings(): Booking[] {
  const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function saveBookings(bookings: Booking[]) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
}

export function createBooking(booking: Booking): Booking {
  const bookings = getBookings()
  bookings.push(booking)
  saveBookings(bookings)
  return booking
}

export function getBookingsByUserId(userId: string): Booking[] {
  const bookings = getBookings()
  return bookings.filter(b => b.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getBookingById(id: string): Booking | null {
  const bookings = getBookings()
  return bookings.find(b => b.id === id) || null
}
