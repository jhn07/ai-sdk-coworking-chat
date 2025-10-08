import { X, MapPin, Star, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Coworking, CoworkingWithBookingInfo } from "@/types"
import { useState } from "react"

interface MapModalProps {
  coworking: Coworking | null
  onClose: () => void
  onBook?: (coworking: CoworkingWithBookingInfo) => void
}

export function MapModal({ coworking, onClose, onBook }: MapModalProps) {
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedDuration, setSelectedDuration] = useState<string>("")

  if (!coworking) return null

  const lat = coworking.lat ?? 45.5276
  const lng = coworking.lng ?? -73.583

  const handleBook = () => {
    if (selectedTime && selectedDuration && onBook) {
      onBook({ ...coworking, time: selectedTime, duration: selectedDuration })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-gray-200/50 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/50">
          <h3 className="text-lg font-bold text-gray-900">{coworking.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Map */}
          <div className="w-full h-64 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
              style={{ border: 0 }}
              title={`Map for ${coworking.name}`}
            />
          </div>

          {/* Location Info */}
          <div className="flex items-start gap-3">
            <MapPin className="text-blue-600 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="font-semibold text-gray-900">{coworking.name}</p>
              <p className="text-gray-600 text-sm">{coworking.address}</p>
              {coworking.district && (
                <p className="text-gray-500 text-xs mt-1">{coworking.district}</p>
              )}
            </div>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center gap-6 pt-2 border-t border-gray-200/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Price:</span>
              <span className="text-base font-semibold text-gray-900">{coworking.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900">{coworking.rating}</span>
            </div>
          </div>

          {/* Amenities */}
          {coworking.amenities && coworking.amenities.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {coworking.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full border border-gray-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Booking Section */}
          {onBook && (
            <div className="space-y-3 pt-2 border-t border-gray-200/50">
              <p className="text-sm font-medium text-gray-700">Select booking details</p>

              {/* Time and Duration Selects */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-300">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "08:00", "09:00", "10:00", "11:00", "12:00",
                      "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
                    ].map((time) => {
                      const hour = parseInt(time.split(':')[0]);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour > 12 ? hour - 12 : hour;
                      return (
                        <SelectItem key={time} value={time}>
                          {displayHour.toString().padStart(2, '0')}:00 {ampm}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-300">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2h">2h</SelectItem>
                    <SelectItem value="4h">4h</SelectItem>
                    <SelectItem value="6h">6h</SelectItem>
                    <SelectItem value="8h">8h</SelectItem>
                    <SelectItem value="Full day">Full day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleBook}
                  disabled={!selectedTime || !selectedDuration}
                  className="flex-1 bg-black text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Book this space
                </Button>
                <Button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                      "_blank",
                    )
                  }
                  variant="outline"
                  className="bg-white/70 text-gray-700 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center gap-2 border-gray-300"
                >
                  <Navigation size={16} />
                  Directions
                </Button>
              </div>
            </div>
          )}

          {/* Directions Button Only (if no booking) */}
          {!onBook && (
            <Button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                  "_blank",
                )
              }
              variant="outline"
              className="w-full bg-white/70 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border-gray-300"
            >
              <Navigation size={16} />
              Get Directions
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}