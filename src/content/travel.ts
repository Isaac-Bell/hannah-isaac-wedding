export type AccommodationRecommendation = {
  name: string;
  area: string;
  description: string;
  bookingUrl: string;
  groupCodeLabel?: string;
  travelTimeNote?: string;
  recommended: boolean;
};

export type ActivityRecommendation = {
  category:
    | "Food and barbecue"
    | "Jazz and music"
    | "Museums"
    | "Parks"
    | "Family-friendly";
  title: string;
  description: string;
  sourceUrl: string;
};

export const travelContent = {
  lastReviewed: "July 12, 2026",
  arrival: {
    airport: "Kansas City International Airport",
    airportCode: "MCI",
    guidance:
      "Allow time to collect luggage and arrange onward transport. Confirm current terminal and airline guidance before travelling.",
    driving:
      "Kansas City is accessible by major interstate routes. Use current navigation guidance and allow extra time around event periods.",
  },
  accommodations: [] as AccommodationRecommendation[],
  gettingAround: [
    [
      "Rental car",
      "Useful for guests planning to explore beyond central Kansas City.",
    ],
    [
      "Rideshare",
      "Check current local availability and estimated pickup times in the provider app.",
    ],
    [
      "Public transport",
      "Review current routes and schedules with the local transit operator before travelling.",
    ],
    [
      "Wedding transport",
      "Shuttle or arranged transport has not been confirmed. Details coming soon.",
    ],
    [
      "Parking",
      "Event parking information will be shared privately once confirmed.",
    ],
  ] as const,
  international: [
    "Check passport validity and official United States entry requirements for your nationality before booking.",
    "Use official government sources to confirm whether a visa or travel authorization is required. Entry cannot be guaranteed by the couple or this website.",
    "Consider suitable travel and medical insurance for your circumstances.",
    "Check roaming costs or arrange a compatible mobile eSIM before departure.",
    "If driving, confirm licence, rental, and insurance requirements directly with your provider.",
    "Cards are widely used, but check foreign transaction fees and keep a small alternative payment option.",
  ],
  activities: [
    ["Food and barbecue", "Kansas City food guide"],
    ["Jazz and music", "Kansas City music guide"],
    ["Museums", "Kansas City museums guide"],
    ["Parks", "Kansas City outdoor guide"],
    ["Family-friendly", "Kansas City family guide"],
  ].map(([category, title]) => ({
    category,
    title,
    description:
      "Browse current visitor information for ideas, opening details, and availability.",
    sourceUrl: "https://www.visitkc.com/",
  })) as ActivityRecommendation[],
} as const;
