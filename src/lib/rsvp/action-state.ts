import type { RsvpFieldErrors } from "./validation";

export type RsvpActionState =
  | { status: "idle"; fieldErrors: RsvpFieldErrors; attempt: number }
  | {
      status: "error";
      message: string;
      fieldErrors: RsvpFieldErrors;
      step: 1 | 2;
      attempt: number;
    }
  | {
      status: "success";
      message: string;
      fieldErrors: RsvpFieldErrors;
      savedAt: string;
      attempt: number;
    };

export const initialRsvpActionState: RsvpActionState = {
  status: "idle",
  fieldErrors: {},
  attempt: 0,
};
