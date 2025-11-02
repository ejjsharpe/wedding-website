import { type } from 'arktype';

// Guest schema with conditional dietary requirements
export const GuestSchema = type({
  name: 'string>0',
  attending: 'boolean',
  'dietaryRequirements?': 'string'
});

// RSVP form schema
export const RSVPFormSchema = type({
  guests: GuestSchema.array(),
  contactEmail: 'email',
  'message?': 'string'
});

// API response schemas
export const RSVPSuccessSchema = type({
  success: 'true',
  message: 'string'
});

export const RSVPErrorSchema = type({
  success: 'false',
  error: 'string'
});

export const RSVPResponseSchema = type.union(RSVPSuccessSchema, RSVPErrorSchema);

// Type exports for use in components
export type Guest = typeof GuestSchema.infer;
export type RSVPForm = typeof RSVPFormSchema.infer;
export type RSVPResponse = typeof RSVPResponseSchema.infer;

// Google Sheets row type
export type SheetRow = {
  timestamp: string;
  contactEmail: string;
  guestName: string;
  attending: string;
  dietaryRequirements: string;
  message: string;
};