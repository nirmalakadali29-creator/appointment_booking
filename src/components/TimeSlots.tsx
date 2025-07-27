import React from 'react';
import { Clock } from 'lucide-react';
import { api, TimeSlot } from '../services/api';

interface TimeSlotsProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export default function TimeSlots({ selectedDate, selectedTime, onTimeSelect }: TimeSlotsProps) {
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAvailableSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const dateString = selectedDate.toISOString().split('T')[0];
        const slots = await api.getAvailableSlots(dateString);
        setTimeSlots(slots);
      } catch (err) {
        setError('Failed to load available time slots');
        console.error('Error fetching slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Available Time Slots</h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Select a time slot for <span className="font-medium text-gray-800">{formatDate(selectedDate)}</span>
      </p>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading available slots...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!loading && timeSlots.length === 0 && !error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">No available time slots for this date.</p>
          <p className="text-yellow-600 text-sm mt-1">Please select a different date.</p>
        </div>
      )}

      <div className="space-y-3">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onTimeSelect(slot.time)}
            className={`
              w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
              hover:scale-[1.02] hover:shadow-md
              ${selectedTime === slot.time
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{slot.label}</span>
              <div className={`
                w-4 h-4 rounded-full border-2 transition-colors
                ${selectedTime === slot.time
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
                }
              `}>
                {selectedTime === slot.time && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}