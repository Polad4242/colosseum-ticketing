// ===== WEEK 1: VENUE DATA MODEL =====
// Everything about the venue lives here. app.js only reads it.
const VENUE = {
  name: "Colosseum",
  currency: "AZN",
  seatSize: 22,   // px, width and height of one seat button
  seatGap: 4,     // px, space between seats
  width: 760,     // px, size of the map canvas
  height: 620,

  // Price categories: one entry per price level
  categories: {
    vip:      { label: "VIP Podium", price: 120, color: "#b83a4b" },
    premium:  { label: "Premium",    price: 80,  color: "#e0a458" },
    standard: { label: "Standard",   price: 50,  color: "#5b8def" },
    economy:  { label: "Economy",    price: 30,  color: "#b07cc6" }
  },

  // Non-seat shapes: the arena floor and entrance gates (x, y, w, h in px)
  landmarks: [
    { label: "ARENA",  cls: "arena", x: 200, y: 170, w: 360, h: 160 },
    { label: "A", title: "Entrance A", cls: "gate", x: 0,   y: 236, w: 28, h: 28 },
    { label: "B", title: "Entrance B", cls: "gate", x: 732, y: 236, w: 28, h: 28 }
  ],

  // Sections: each one generates rows x seatsPerRow seats.
  // x, y = position of the section on the map canvas (px).
  sections: [
    { id: "UN",  name: "Upper North",      category: "standard", rows: 2, seatsPerRow: 24, x: 68,  y: 0 },
    { id: "NP",  name: "North Podium",     category: "vip",      rows: 3, seatsPerRow: 14, x: 198, y: 76 },
    { id: "WL",  name: "West Lower",       category: "premium",  rows: 6, seatsPerRow: 6,  x: 34,  y: 170 },
    { id: "EL",  name: "East Lower",       category: "premium",  rows: 6, seatsPerRow: 6,  x: 574, y: 170 },
    { id: "SL",  name: "South Lower",      category: "premium",  rows: 3, seatsPerRow: 14, x: 198, y: 342 },
    { id: "US",  name: "Upper South",      category: "standard", rows: 3, seatsPerRow: 24, x: 68,  y: 440 },
    { id: "GAL", name: "Gallery",          category: "economy",  rows: 3, seatsPerRow: 24, x: 68,  y: 536 }
  ],

  // Seat IDs that are already sold. Format: SECTION-RowLetterSeatNumber
  unavailable: ["NP-B5", "NP-B6", "SL-A7", "SL-A8", "WL-C3", "EL-D4", "UN-A10", "UN-A11",
                "US-B14", "US-C15", "GAL-A5", "GAL-C20"]
};
