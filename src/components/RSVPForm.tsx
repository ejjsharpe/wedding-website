import { useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import type { Guest, RSVPForm, RSVPResponse } from "../types/rsvp";
import styles from "./RSVPForm.module.css";
import { motion } from "framer-motion";

interface RSVPFormProps {
  onSuccess?: () => void;
}

// Animation constants
const ANIMATION_DURATION = 0.3;
const ANIMATION_EASING = "easeInOut" as const;

// Default guest template
const createDefaultGuest = (): Guest => ({
  firstName: "",
  lastName: "",
  rsvp: true,
  eventsAttending: [] as string[],
  dietaryRequirements: "",
});

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const form = useForm({
    defaultValues: {
      guests: [createDefaultGuest()],
    },
    onSubmit: async ({ value }) => {
      try {
        const formData: RSVPForm = {
          guests: value.guests.filter(
            (guest: Guest) =>
              guest.firstName.trim() !== "" && guest.lastName.trim() !== ""
          ),
        };

        const response = await fetch("/api/rsvp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        const result: RSVPResponse = await response.json();

        if (result.success) {
          form.reset();
          onSuccess?.();
          return {
            type: "success" as const,
            message: result.message,
          };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        throw new Error(
          error instanceof Error
            ? error.message
            : "Network error. Please check your connection and try again."
        );
      }
    },
  });

  const addGuest = useCallback(() => {
    const currentGuests = form.getFieldValue("guests");
    form.setFieldValue("guests", [...currentGuests, createDefaultGuest()]);
  }, [form]);

  const removeGuest = useCallback(
    (index: number) => {
      const currentGuests = form.getFieldValue("guests");
      if (currentGuests.length > 1) {
        form.setFieldValue(
          "guests",
          currentGuests.filter((_, i) => i !== index)
        );
      }
    },
    [form]
  );

  const updateGuest = useCallback(
    (index: number, field: keyof Guest, value: string | string[] | boolean) => {
      const currentGuests = form.getFieldValue("guests");
      const updatedGuests = currentGuests.map((guest, i) => {
        if (i === index) {
          const updatedGuest = { ...guest, [field]: value };
          // Clear dietary requirements and events if declining
          if (field === "rsvp" && value === false) {
            updatedGuest.dietaryRequirements = "";
            updatedGuest.eventsAttending = [] as string[];
          }
          return updatedGuest;
        }
        return guest;
      });
      form.setFieldValue("guests", updatedGuests);
    },
    [form]
  );

  // Memoized animation props
  const guestCardAnimation = useMemo(
    () => ({
      initial: { opacity: 0, height: 0, y: -20 },
      animate: { opacity: 1, height: "auto", y: 0 },
      transition: { duration: ANIMATION_DURATION, ease: ANIMATION_EASING },
    }),
    []
  );

  const eventsAnimation = useMemo(
    () => ({
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: "auto" },
      transition: { duration: ANIMATION_DURATION, ease: ANIMATION_EASING },
    }),
    []
  );

  const removeButtonAnimation = useMemo(
    () => ({
      initial: { opacity: 0 },
      transition: { duration: ANIMATION_DURATION, ease: ANIMATION_EASING },
    }),
    []
  );

  return (
    <div className={styles.rsvpForm}>
      <p className={styles.rsvpSubheading}>
        We kindly ask that you RSVP by January 31st. Please make sure to add all
        guests before submitting.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* Guests Section */}
        <form.Field name="guests">
          {(field) => (
            <div className={styles.guestsSection}>
              {field.state.value.map((guest, index) => (
                <motion.div
                  key={`guest-${index}`}
                  className={styles.guestCard}
                  initial={index === 0 ? false : guestCardAnimation.initial}
                  animate={guestCardAnimation.animate}
                  transition={guestCardAnimation.transition}
                >
                  <div className={styles.guestHeader}>
                    <h3 className={styles.guestTitle}>Guest {index + 1}</h3>
                    <motion.button
                      type="button"
                      onClick={() => removeGuest(index)}
                      className={styles.removeGuestBtn}
                      aria-label={`Remove guest ${index + 1}`}
                      initial={removeButtonAnimation.initial}
                      animate={{
                        opacity: field.state.value.length > 1 ? 1 : 0,
                      }}
                      transition={removeButtonAnimation.transition}
                    >
                      ✕
                    </motion.button>
                  </div>

                  <div className={styles.nameRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor={`guest-first-name-${index}`}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        id={`guest-first-name-${index}`}
                        value={guest.firstName}
                        onChange={(e) =>
                          updateGuest(index, "firstName", e.target.value)
                        }
                        required
                        className={styles.formInput}
                        placeholder="First name"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor={`guest-last-name-${index}`}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id={`guest-last-name-${index}`}
                        value={guest.lastName}
                        onChange={(e) =>
                          updateGuest(index, "lastName", e.target.value)
                        }
                        required
                        className={styles.formInput}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>RSVP *</label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`rsvp-${index}`}
                          checked={guest.rsvp === true}
                          onChange={() => updateGuest(index, "rsvp", true)}
                        />
                        Accept with pleasure
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name={`rsvp-${index}`}
                          checked={guest.rsvp === false}
                          onChange={() => updateGuest(index, "rsvp", false)}
                        />
                        Decline with regret
                      </label>
                    </div>
                  </div>

                  {guest.rsvp === true && (
                    <motion.div
                      initial={index === 0 ? false : eventsAnimation.initial}
                      animate={eventsAnimation.animate}
                      transition={eventsAnimation.transition}
                    >
                      <div className={styles.formGroup}>
                        <label>Which events will you be attending? *</label>
                        <div
                          className={styles.checkboxGroup}
                          role="group"
                          aria-labelledby={`events-label-${index}`}
                        >
                          <label className={styles.radioLabel}>
                            <input
                              type="checkbox"
                              checked={guest.eventsAttending.includes(
                                "ceremony"
                              )}
                              onChange={(e) => {
                                const events = guest.eventsAttending.filter(
                                  (event) => event !== "ceremony"
                                );
                                if (e.target.checked) events.push("ceremony");
                                updateGuest(index, "eventsAttending", events);
                              }}
                              aria-describedby={
                                guest.eventsAttending.length === 0
                                  ? `events-error-${index}`
                                  : undefined
                              }
                            />
                            Ceremony
                          </label>
                          <label className={styles.radioLabel}>
                            <input
                              type="checkbox"
                              checked={guest.eventsAttending.includes(
                                "reception"
                              )}
                              onChange={(e) => {
                                const events = guest.eventsAttending.filter(
                                  (event) => event !== "reception"
                                );
                                if (e.target.checked) events.push("reception");
                                updateGuest(index, "eventsAttending", events);
                              }}
                              aria-describedby={
                                guest.eventsAttending.length === 0
                                  ? `events-error-${index}`
                                  : undefined
                              }
                            />
                            Reception
                          </label>
                        </div>
                        {guest.rsvp === true &&
                          guest.eventsAttending.length === 0 && (
                            <div
                              id={`events-error-${index}`}
                              className={styles.validationError}
                              role="alert"
                              aria-live="polite"
                            >
                              Please select at least one event to attend
                            </div>
                          )}
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor={`dietary-${index}`}>
                          Dietary Requirements
                        </label>
                        <input
                          type="text"
                          id={`dietary-${index}`}
                          value={guest.dietaryRequirements || ""}
                          onChange={(e) =>
                            updateGuest(
                              index,
                              "dietaryRequirements",
                              e.target.value
                            )
                          }
                          className={styles.formInput}
                          placeholder="Any dietary restrictions or allergies?"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
              <button
                type="button"
                onClick={addGuest}
                className={styles.addGuestBtn}
              >
                Add Another Guest
              </button>
            </div>
          )}
        </form.Field>

        {/* Submit Status */}
        <form.Subscribe
          selector={(state) => [
            state.submissionAttempts,
            state.isSubmitting,
            state.values.guests,
          ]}
        >
          {([submissionAttempts, isSubmitting, guests]) => {
            const hasValidGuests = (guests as Guest[]).some(
              (guest: Guest) =>
                guest.firstName.trim() !== "" && guest.lastName.trim() !== ""
            );

            const hasValidEvents = (guests as Guest[]).every(
              (guest: Guest) =>
                guest.rsvp === false ||
                (guest.rsvp === true && guest.eventsAttending.length > 0)
            );

            return (
              <>
                {typeof submissionAttempts === "number" &&
                  submissionAttempts > 0 &&
                  form.state.submissionAttempts > 0 && (
                    <div
                      className={`${styles.statusMessage} ${styles.success}`}
                    >
                      RSVP submitted successfully! Thank you for responding.
                    </div>
                  )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    !hasValidGuests ||
                    !hasValidEvents ||
                    (typeof isSubmitting === "boolean" && isSubmitting)
                  }
                  className={styles.submitBtn}
                >
                  {typeof isSubmitting === "boolean" && isSubmitting
                    ? "Submitting..."
                    : "Submit RSVP"}
                </button>
              </>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}
