import { type } from "arktype";

export const GuestSchema = type({
  firstName: "string>0",
  lastName: "string>0",
  rsvp: "boolean",
  eventsAttending: "string[]",
  "dietaryRequirements?": "string",
}).pipe((guest, ctx) => {
  if (guest.rsvp === true && guest.eventsAttending.length === 0) {
    return ctx.error("Must select at least one event when accepting invitation");
  }
  return guest;
});

export const RSVPFormSchema = type({
  guests: GuestSchema.array(),
});

export const RSVPSuccessSchema = type({
  success: "true",
  message: "string",
});

export const RSVPErrorSchema = type({
  success: "false",
  error: "string",
});

export const RSVPResponseSchema = type.or(RSVPSuccessSchema, RSVPErrorSchema);

export type Guest = typeof GuestSchema.infer;
export type RSVPForm = typeof RSVPFormSchema.infer;
export type RSVPResponse = typeof RSVPResponseSchema.infer;

export type SheetRow = {
  timestamp: string;
  firstName: string;
  lastName: string;
  rsvp: string;
  ceremony: number;
  reception: number;
  dietaryRequirements: string;
};
