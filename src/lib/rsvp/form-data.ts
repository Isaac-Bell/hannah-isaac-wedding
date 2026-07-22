type RawGuest = {
  guestId: string;
  attending?: unknown;
  dietaryRequirements: unknown;
  accessibilityRequirements: unknown;
  eventChoices: Record<string, unknown>;
};

function scalar(values: FormDataEntryValue[]) {
  return values.length === 1 ? values[0] : values;
}

export function rsvpSubmissionFromFormData(formData: FormData) {
  const orderedGuestIds: string[] = [];
  const guestMap = new Map<string, RawGuest>();

  function guest(id: string) {
    let current = guestMap.get(id);
    if (!current) {
      current = {
        guestId: id,
        dietaryRequirements: "",
        accessibilityRequirements: "",
        eventChoices: {},
      };
      guestMap.set(id, current);
    }
    return current;
  }

  function guestFromField(id: string) {
    if (!guestMap.has(id)) orderedGuestIds.push(id);
    return guest(id);
  }

  for (const value of formData.getAll("guestId")) {
    if (typeof value === "string") {
      guest(value);
      // Keep duplicate hidden IDs so the shared schema can reject them rather
      // than silently collapsing malformed submissions.
      orderedGuestIds.push(value);
    }
  }

  for (const key of new Set([...formData.keys()])) {
    const values = formData.getAll(key);
    if (key.startsWith("attendance:")) {
      const id = key.slice("attendance:".length);
      const value = scalar(values);
      guestFromField(id).attending =
        value === "yes" ? true : value === "no" ? false : value;
    } else if (key.startsWith("dietary:")) {
      guestFromField(key.slice("dietary:".length)).dietaryRequirements =
        scalar(values);
    } else if (key.startsWith("accessibility:")) {
      guestFromField(
        key.slice("accessibility:".length),
      ).accessibilityRequirements = scalar(values);
    } else if (key.startsWith("event:")) {
      const [, id, ...eventParts] = key.split(":");
      const eventKey = eventParts.join(":");
      const value = scalar(values);
      guestFromField(id).eventChoices[eventKey] =
        value === "true" ? true : value;
    }
  }

  return {
    contactEmail: scalar(formData.getAll("contactEmail")),
    contactPhone: scalar(formData.getAll("contactPhone")),
    songRequest: scalar(formData.getAll("songRequest")),
    message: scalar(formData.getAll("message")),
    guests: orderedGuestIds.map((id) => guestMap.get(id)),
  };
}
