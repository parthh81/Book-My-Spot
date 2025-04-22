import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaUser, FaPhone, FaEnvelope, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookingDetailsForm = ({ 
  eventData, 
  venueData, 
  onSubmit, 
  previousStep 
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      eventDate: '',
      guestCount: 0,
      startTime: '',
      endTime: '',
      specialRequests: ''
    }
  });

  const [showInclusions, setShowInclusions] = useState(false);
  const [showExclusions, setShowExclusions] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

  // Calculate total pricing
  const calculateTotal = () => {
    const basePrice = venueData?.pricing?.basePrice || 0;
    const guestCount = parseInt(watch('guestCount')) || 0;
    
    // Additional guests pricing
    const additionalGuestPrice = venueData?.pricing?.additionalGuestPrice || 0;
    const includedGuests = venueData?.pricing?.includedGuests || 0;
    
    let additionalGuestCost = 0;
    if (guestCount > includedGuests) {
      additionalGuestCost = (guestCount - includedGuests) * additionalGuestPrice;
    }
    
    // Service fee
    const serviceFee = venueData?.pricing?.serviceFee || 0;
    
    // Subtotal
    const subtotal = basePrice + additionalGuestCost + serviceFee;
    
    // GST calculation (assuming 18%)
    const gstPercent = 18;
    const gstAmount = (subtotal * gstPercent) / 100;
    
    // Total
    const total = subtotal + gstAmount;
    
    return {
      basePrice,
      additionalGuestCost,
      serviceFee,
      subtotal,
      gstAmount,
      gstPercent,
      total
    };
  };

  const pricing = calculateTotal();

  const submitForm = (data) => {
    // Create the complete booking data object
    const bookingData = {
      ...data,
      eventId: eventData?.id,
      eventName: eventData?.name,
      venueId: venueData?.id,
      venueName: venueData?.name,
      eventType: eventData?.category,
      location: venueData?.location,
      inclusions: venueData?.inclusions || [],
      exclusions: venueData?.exclusions || [],
      cancellationPolicy: venueData?.cancellationPolicy || {},
      ...pricing
    };

    onSubmit(bookingData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Booking Details</h2>
      
      {/* Event and Venue Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Event Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Event:</span> {eventData?.name}</p>
            <p><span className="font-medium">Type:</span> {eventData?.category}</p>
            <p><span className="font-medium">Venue:</span> {venueData?.name}</p>
          </div>
          <div>
            <p><span className="font-medium">Location:</span> {venueData?.location}</p>
            <p><span className="font-medium">Capacity:</span> {venueData?.capacity} guests</p>
          </div>
        </div>

        {/* Inclusions */}
        <div className="mt-4">
          <button 
            type="button"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={() => setShowInclusions(!showInclusions)}
          >
            <FaInfoCircle />
            <span className="font-medium">{showInclusions ? 'Hide Inclusions' : 'Show Inclusions'}</span>
          </button>
          
          {showInclusions && (
            <div className="mt-2 p-3 bg-green-50 rounded">
              <h4 className="font-medium text-green-700 mb-2">What's Included:</h4>
              <ul className="list-none">
                {venueData?.inclusions?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 mb-1">
                    <FaCheckCircle className="text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
                {!venueData?.inclusions?.length && <li>No inclusions specified</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Exclusions */}
        <div className="mt-4">
          <button 
            type="button"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={() => setShowExclusions(!showExclusions)}
          >
            <FaInfoCircle />
            <span className="font-medium">{showExclusions ? 'Hide Exclusions' : 'Show Exclusions'}</span>
          </button>
          
          {showExclusions && (
            <div className="mt-2 p-3 bg-red-50 rounded">
              <h4 className="font-medium text-red-700 mb-2">Not Included:</h4>
              <ul className="list-none">
                {venueData?.exclusions?.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 mb-1">
                    <FaTimesCircle className="text-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
                {!venueData?.exclusions?.length && <li>No exclusions specified</li>}
              </ul>
            </div>
          )}
        </div>

        {/* Cancellation Policy */}
        <div className="mt-4">
          <button 
            type="button"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            onClick={() => setShowCancellationPolicy(!showCancellationPolicy)}
          >
            <FaInfoCircle />
            <span className="font-medium">{showCancellationPolicy ? 'Hide Cancellation Policy' : 'Show Cancellation Policy'}</span>
          </button>
          
          {showCancellationPolicy && (
            <div className="mt-2 p-3 bg-blue-50 rounded">
              <h4 className="font-medium text-blue-700 mb-2">Cancellation Policy:</h4>
              <ul className="list-none">
                <li className="mb-1">
                  Full refund if cancelled {venueData?.cancellationPolicy?.fullRefund || 0} days before the event
                </li>
                <li className="mb-1">
                  {venueData?.cancellationPolicy?.partialRefundPercent || 0}% refund if cancelled {venueData?.cancellationPolicy?.partialRefund || 0} days before the event
                </li>
                <li className="mb-1">
                  No refund if cancelled less than {venueData?.cancellationPolicy?.partialRefund || 0} days before the event
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(submitForm)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="col-span-2">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Contact Information</h3>
          </div>
          
          {/* Contact Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-500" />
                Contact Name *
              </div>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md ${errors.contactName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Full Name"
              {...register('contactName', { required: 'Contact name is required' })}
            />
            {errors.contactName && (
              <p className="mt-1 text-sm text-red-500">{errors.contactName.message}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-500" />
                Contact Phone *
              </div>
            </label>
            <input
              type="tel"
              className={`w-full px-3 py-2 border rounded-md ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Phone Number"
              {...register('contactPhone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid 10-digit phone number'
                }
              })}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-500" />
                Contact Email *
              </div>
            </label>
            <input
              type="email"
              className={`w-full px-3 py-2 border rounded-md ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Email Address"
              {...register('contactEmail', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-500">{errors.contactEmail.message}</p>
            )}
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                Event Date *
              </div>
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-md ${errors.eventDate ? 'border-red-500' : 'border-gray-300'}`}
              {...register('eventDate', { required: 'Event date is required' })}
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-500">{errors.eventDate.message}</p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
            <input
              type="time"
              className={`w-full px-3 py-2 border rounded-md ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
              {...register('startTime', { required: 'Start time is required' })}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <input
              type="time"
              className={`w-full px-3 py-2 border rounded-md ${errors.endTime ? 'border-red-500' : 'border-gray-300'}`}
              {...register('endTime', { required: 'End time is required' })}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-500">{errors.endTime.message}</p>
            )}
          </div>

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <FaUsers className="text-gray-500" />
                Number of Guests *
              </div>
            </label>
            <input
              type="number"
              min="1"
              max={venueData?.capacity || 1000}
              className={`w-full px-3 py-2 border rounded-md ${errors.guestCount ? 'border-red-500' : 'border-gray-300'}`}
              {...register('guestCount', { 
                required: 'Guest count is required',
                min: {
                  value: 1,
                  message: 'Guest count must be at least 1'
                },
                max: {
                  value: venueData?.capacity || 1000,
                  message: `Guest count cannot exceed venue capacity of ${venueData?.capacity || 1000}`
                },
                valueAsNumber: true
              })}
            />
            {errors.guestCount && (
              <p className="mt-1 text-sm text-red-500">{errors.guestCount.message}</p>
            )}
            <p className="mt-1 text-xs text-blue-600">
              Maximum venue capacity: {venueData?.capacity || 'Not specified'} guests
            </p>
          </div>

          {/* Special Requests */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests / Notes</label>
            <textarea
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any special requests or additional information..."
              {...register('specialRequests')}
            ></textarea>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="mb-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Pricing Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>₹{pricing.basePrice.toLocaleString()}</span>
            </div>
            {pricing.additionalGuestCost > 0 && (
              <div className="flex justify-between">
                <span>Additional Guests:</span>
                <span>₹{pricing.additionalGuestCost.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Service Fee:</span>
              <span>₹{pricing.serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>GST ({pricing.gstPercent}%):</span>
              <span>₹{pricing.gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>₹{pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={previousStep}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingDetailsForm; 