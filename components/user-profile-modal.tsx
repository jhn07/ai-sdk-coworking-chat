"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/providers/user-context"
import { X, User, Mail, Calendar, Loader2 } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { toast } from "sonner"
import type { SavedBooking } from "@/types"

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, setUser } = useUser()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [serverBookings, setServerBookings] = useState<SavedBooking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  // Fetch bookings from server when modal opens and user is logged in
  useEffect(() => {
    async function fetchBookings() {
      if (!user || !isOpen) return

      setIsLoadingBookings(true)
      try {
        const response = await fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`)
        if (response.ok) {
          const data = await response.json()
          setServerBookings(data.bookings || [])
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setIsLoadingBookings(false)
      }
    }

    fetchBookings()
  }, [user, isOpen])

  const handleSave = async () => {
    if (name && email) {
      // Показываем индикатор загрузки
      setIsSaving(true);
      try {
        await setUser({ name, email });
        onClose();
      } catch (error) {
        console.error("Failed to save user:", error);
        toast.error("Failed to save profile. Please try again.")
      } finally {
        setIsSaving(false);
      }
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setServerBookings([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {user ? (
            <>
              {/* User Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>Name: {user.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} />
                  <span>Email: {user.email}</span>
                </div>
              </div>

              {/* Bookings History */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-gray-600" />
                  <h3 className="font-medium">Booking History ({serverBookings.length})</h3>
                </div>

                {isLoadingBookings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                  </div>
                ) : serverBookings.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {serverBookings.map((savedBooking) => (
                      <div key={savedBooking.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="font-medium">{savedBooking.coworking_name}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {savedBooking.date} at {savedBooking.time} • {savedBooking.duration}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {savedBooking.price}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No bookings yet
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex-1"
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Sign In Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!name || !email || isSaving}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
