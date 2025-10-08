import { Calendar, Clock, MapPin, DollarSign, CheckCircle } from "lucide-react";

interface BookingConfirmationProps {
  booking: {
    coworking: string;
    date: string;
    time: string;
    duration: string;
    price: string;
    address?: string;
    timezone?: string;
  };
  confirmationId?: string;
}

export function BookingConfirmation({ booking, confirmationId }: BookingConfirmationProps) {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display (convert 24h to 12h with AM/PM)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <CheckCircle className="text-green-600" size={20} />
        <h3 className="font-semibold text-gray-900">Booking Confirmed</h3>
      </div>

      {/* Booking details */}
      <div className="space-y-3">
        {/* Coworking name */}
        <div>
          <h4 className="font-semibold text-lg text-gray-900">{booking.coworking}</h4>
          {booking.address && (
            <div className="flex items-start gap-2 mt-1">
              <MapPin size={14} className="text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{booking.address}</p>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(booking.date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock size={16} className="text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Time & Duration</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTime(booking.time)} • {booking.duration}
              </p>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
          <DollarSign size={16} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-medium text-gray-900">{booking.price}</p>
          </div>
        </div>

        {/* Confirmation ID */}
        {confirmationId && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">Confirmation ID</p>
            <p className="text-sm font-mono text-gray-700">{confirmationId}</p>
          </div>
        )}
      </div>

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}