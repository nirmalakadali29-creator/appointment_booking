import React from 'react';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import SuccessMessage from './components/SuccessMessage';
import Logo from './Gene-Power-Logo.png';

type BookingStep = 'calendar' | 'timeSlot' | 'form' | 'success';

interface BookingData {
  name: string;
  phone: string;
  notes: string;
  date: Date;
  time: string;
  smsMessage: string;
}

function App() {
  const [currentStep, setCurrentStep] = React.useState<BookingStep>('calendar');
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [bookingData, setBookingData] = React.useState<BookingData | null>(null);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('timeSlot');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('form');
  };

  const handleFormSubmit = (formData: { name: string; phone: string; notes: string; smsMessage: string }) => {
    const booking: BookingData = {
      ...formData,
      date: selectedDate!,
      time: selectedTime!,
    };
    setBookingData(booking);
    setCurrentStep('success');
  };

  const handleNewBooking = () => {
    setCurrentStep('calendar');
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingData(null);
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'calendar', label: 'Select Date', active: currentStep === 'calendar' },
      { key: 'timeSlot', label: 'Select Time', active: currentStep === 'timeSlot' },
      { key: 'form', label: 'Enter Details', active: currentStep === 'form' },
      { key: 'success', label: 'Confirmation', active: currentStep === 'success' },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors
              ${step.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {index + 1}
            </div>
            <span className={`
              mx-2 text-sm font-medium
              ${step.active ? 'text-blue-600' : 'text-gray-500'}
            `}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-gray-300 mx-2"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center">
              <img src={Logo} alt="Gene Power Logo" className="h-12 w-auto" />
            </div>
            {/* <h1 className="text-3xl font-bold text-gray-800">Genepowerx</h1> */}
          </div>
            <h1 className="text-gray-700 max-w-2xl mx-auto font-serif text-3xl font-bold">
            K & H Lifestyle Program
            </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book your appointment easily with our streamlined booking system.
            Select your preferred date and time, and we'll take care of the rest.
          </p>
        </div>

        {/* Step Indicator */}
        {getStepIndicator()}

        {/* Main Content */}
        {/* Back Button */}
        {(currentStep === 'timeSlot' || currentStep === 'form') && (
          <div className="text-left max-w-4xl mx-auto mb-4">
            <button
              onClick={() => {
                if (currentStep === 'form') setCurrentStep('timeSlot');
                else if (currentStep === 'timeSlot') setCurrentStep('calendar');
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              ← Go Back
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {currentStep === 'calendar' && (
            <div className="max-w-md mx-auto">
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          )}

          {currentStep === 'timeSlot' && selectedDate && (

            <div className="max-w-md mx-auto">
              <TimeSlots
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
              />
            </div>
          )}

          {currentStep === 'form' && selectedDate && selectedTime && (
            <div className="max-w-md mx-auto">
              <BookingForm
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSubmit={handleFormSubmit}
              />
            </div>
          )}

          {currentStep === 'success' && bookingData && (
            <SuccessMessage
              bookingData={bookingData}
              onNewBooking={handleNewBooking}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>© 2025 Genepowerx. Available Monday to Friday, 9 AM - 12 PM.</p>
        </div>
      </div>
    </div>
  );
}

export default App;