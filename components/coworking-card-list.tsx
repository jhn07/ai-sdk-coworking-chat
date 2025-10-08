import { useState } from "react"
import type { Coworking, CoworkingWithBookingInfo } from "@/types"
import { Star } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { cn } from "@/lib/utils"

interface CoworkingCardListProps {
  coworkings: Coworking[];
  fallback: Coworking[];
  onBook?: (coworking: CoworkingWithBookingInfo) => void;
  onShowMap?: (coworking: Coworking) => void;
  appliedFilters?: {
    maxPrice?: number;
    teamSize?: string;
    amenities?: string[];
  }
}

export function CoworkingCardList({
  coworkings,
  fallback,
  onBook,
  onShowMap,
  appliedFilters
}: CoworkingCardListProps) {
  const hasResults = coworkings.length > 0;
  const hasFallback = fallback.length > 0;
  const hasFilters = appliedFilters && (
    appliedFilters.maxPrice ||
    appliedFilters.teamSize ||
    appliedFilters.amenities?.length
  )

  return (
    <div className="space-y-6">

      {/* Applied Filters */}
      {hasFilters && (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-600">Filters:</span>
          {appliedFilters.maxPrice && (
            <span className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Under ${appliedFilters.maxPrice}/day
            </span>
          )}
          {appliedFilters.teamSize && (
            <span className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              {appliedFilters.teamSize === 'solo' ? 'Solo' : appliedFilters.teamSize === 'small' ? 'Small team' : 'Large team'}
            </span>
          )}
          {appliedFilters.amenities?.map(amenity => (
            <span key={amenity} className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
              {amenity}
            </span>
          ))}
        </div>
      )}


      {/* Main results */}
      {hasResults && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Found {coworkings.length} {coworkings.length === 1 ? 'space' : 'spaces'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coworkings.map((cw) => (
              <CoworkingCard
                key={cw.name}
                coworking={cw}
                onBook={onBook}
                onShowMap={onShowMap}
                variant="primary"
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback results */}
      {hasFallback && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200" />
            <h3 className="text-sm font-semibold text-gray-500">
              Also consider nearby ({fallback.length})
            </h3>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fallback.map((cw) => (
              <CoworkingCard
                key={cw.name}
                coworking={cw}
                onBook={onBook}
                onShowMap={onShowMap}
                variant="fallback"
              />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!hasResults && !hasFallback && (
        <div className="text-center py-8 text-gray-500">
          No coworking spaces found. Try a different search.
        </div>
      )}
    </div>
  );
}

interface CoworkingCardProps {
  coworking: Coworking;
  onBook?: (coworking: Coworking & { time: string; duration: string }) => void;
  onShowMap?: (coworking: Coworking) => void;
  variant?: "primary" | "fallback";
}

function CoworkingCard({
  coworking,
  onBook,
  onShowMap,
  variant = "primary"
}: CoworkingCardProps) {
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

  const handleBook = () => {
    if (selectedTime && selectedDuration && onBook) {
      onBook({ ...coworking, time: selectedTime, duration: selectedDuration });
      // Reset selections after booking
      setSelectedTime("");
      setSelectedDuration("");
    }
  };

  const isPrimary = variant === "primary";

  return (
    <div
      className={cn("bg-white/70 backdrop-blur-lg rounded-2xl overflow-hidden transition-all duration-300",
        isPrimary
          ? 'border-2 border-black/20 shadow-xl hover:shadow-2xl'
          : 'border border-gray-200/50 shadow-md hover:shadow-lg opacity-90'
      )}
    >
      {/* Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={coworking.image}
          alt={coworking.name}
          fill
          className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Address */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-1">
            {coworking.name}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {coworking.address}
          </p>
        </div>

        {/* Price & Rating */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900">{coworking.price}</span>
          <div className="flex items-center gap-1 text-gray-900">
            <Star size={12} fill="currentColor" />
            <span className="text-xs">{coworking.rating}</span>
          </div>
        </div>

        {/* Amenities */}
        <p className="text-xs text-gray-500 line-clamp-1">
          {coworking.amenities?.slice(0, 2).join(" • ")}
        </p>

        {/* Booking controls */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="text-xs h-8 rounded-lg border-gray-300">
                <SelectValue placeholder="Time" />
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
              <SelectTrigger className="text-xs h-8 rounded-lg border-gray-300">
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

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBook}
              disabled={!selectedTime || !selectedDuration || !onBook}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Book
            </button>
            <button
              onClick={() => onShowMap?.(coworking)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
            >
              Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}