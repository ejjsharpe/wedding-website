import { useState } from 'react';
import type { Guest, RSVPForm, RSVPResponse } from '../types/rsvp';

interface RSVPFormProps {
  onSuccess?: () => void;
}

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const [guests, setGuests] = useState<Guest[]>([
    { name: '', attending: true, dietaryRequirements: '' }
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const addGuest = () => {
    setGuests([...guests, { name: '', attending: true, dietaryRequirements: '' }]);
  };

  const removeGuest = (index: number) => {
    if (guests.length > 1) {
      setGuests(guests.filter((_, i) => i !== index));
    }
  };

  const updateGuest = (index: number, field: keyof Guest, value: string | boolean) => {
    const updatedGuests = guests.map((guest, i) => {
      if (i === index) {
        const updatedGuest = { ...guest, [field]: value };
        // Clear dietary requirements if not attending
        if (field === 'attending' && !value) {
          updatedGuest.dietaryRequirements = '';
        }
        return updatedGuest;
      }
      return guest;
    });
    setGuests(updatedGuests);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const formData: RSVPForm = {
        guests: guests.filter(guest => guest.name.trim() !== ''),
        contactEmail,
        message: message.trim() || undefined
      };

      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result: RSVPResponse = await response.json();

      if (result.success) {
        setSubmitStatus({ type: 'success', message: result.message });
        // Reset form
        setGuests([{ name: '', attending: true, dietaryRequirements: '' }]);
        setContactEmail('');
        setMessage('');
        onSuccess?.();
      } else {
        setSubmitStatus({ type: 'error', message: result.error });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = contactEmail.trim() !== '' && 
                   guests.some(guest => guest.name.trim() !== '') &&
                   !isSubmitting;

  return (
    <div className="rsvp-form">
      <form onSubmit={handleSubmit}>
        {/* Contact Email */}
        <div className="form-group">
          <label htmlFor="contactEmail">Contact Email *</label>
          <input
            type="email"
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="form-input"
            placeholder="your.email@example.com"
          />
        </div>

        {/* Guests Section */}
        <div className="guests-section">
          <h3>Guests</h3>
          {guests.map((guest, index) => (
            <div key={index} className="guest-card">
              <div className="guest-header">
                <h4>Guest {index + 1}</h4>
                {guests.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="remove-guest-btn"
                    aria-label={`Remove guest ${index + 1}`}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`guest-name-${index}`}>Name *</label>
                <input
                  type="text"
                  id={`guest-name-${index}`}
                  value={guest.name}
                  onChange={(e) => updateGuest(index, 'name', e.target.value)}
                  required
                  className="form-input"
                  placeholder="Guest name"
                />
              </div>

              <div className="form-group">
                <label>Will you be attending?</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`attending-${index}`}
                      checked={guest.attending}
                      onChange={() => updateGuest(index, 'attending', true)}
                    />
                    Yes, I'll be there!
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name={`attending-${index}`}
                      checked={!guest.attending}
                      onChange={() => updateGuest(index, 'attending', false)}
                    />
                    Sorry, can't make it
                  </label>
                </div>
              </div>

              {guest.attending && (
                <div className="form-group">
                  <label htmlFor={`dietary-${index}`}>Dietary Requirements</label>
                  <input
                    type="text"
                    id={`dietary-${index}`}
                    value={guest.dietaryRequirements || ''}
                    onChange={(e) => updateGuest(index, 'dietaryRequirements', e.target.value)}
                    className="form-input"
                    placeholder="Any dietary restrictions or allergies?"
                  />
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addGuest}
            className="add-guest-btn"
          >
            + Add Another Guest
          </button>
        </div>

        {/* Message */}
        <div className="form-group">
          <label htmlFor="message">Message (Optional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-textarea"
            placeholder="Any special message for the happy couple?"
            rows={4}
          />
        </div>

        {/* Submit Status */}
        {submitStatus.type && (
          <div className={`status-message ${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="submit-btn"
        >
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </button>
      </form>
    </div>
  );
}