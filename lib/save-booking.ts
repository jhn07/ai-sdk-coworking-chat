import { supabase } from './supabase'
import type { BookingData, User } from '@/types'

export async function saveBookingToFile(
  user: User,
  booking: BookingData
) {
  // Сначала убедись что user существует
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('email')
    .eq('email', user.email)
    .single()

  if (userError || !existingUser) {
    // Создай user если не существует
    const { error: insertError } = await supabase
      .from('users')
      .insert({ name: user.name, email: user.email })

    if (insertError) {
      throw new Error('Failed to create user')
    }
  }

  // Теперь создай booking
  const { error } = await supabase
    .from('bookings')
    .insert({
      user_email: user.email,
      coworking_name: booking.coworking,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      price: booking.price,
      address: booking.address,
      lat: booking.lat,
      lng: booking.lng,
      timezone: booking.timezone,
    })

  if (error) {
    throw new Error('Failed to save booking')
  }
}