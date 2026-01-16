import { Event, Vendor, DashboardMetric, Conversation, DirectMessage } from "../types";

export const MOCK_EVENTS: Event[] = [
  {
    id: "e-1",
    title: "Summer Music Festival",
    date: "2024-07-15T18:00:00",
    location: "Zilker Park, Austin, TX",
    description: "A three-day music festival featuring top artists from around the world. Food trucks, art installations, and more!",
    category: "Music",
    price: "₹15000",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1000",
    attendees: 1250,
    coordinates: { lat: 30.2672, lng: -97.7431 },
    organizerId: "v-1",
    status: "Confirmed",
    organizer: "Acme Events",
    gallery: [
      "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1459749411177-0473ef716175?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "e-2",
    title: "Tech Innovators Summit",
    date: "2024-08-10T09:00:00",
    location: "Convention Center, Austin, TX",
    description: "Join industry leaders and tech enthusiasts for a day of keynotes, workshops, and networking.",
    category: "Tech",
    price: "₹2999",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
    attendees: 800,
    coordinates: { lat: 30.2850, lng: -97.7300 },
    organizerId: "p-1",
    status: "Confirmed",
    organizer: "Sarah Planner",
    gallery: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "e-3",
    title: "Community Art Walk",
    date: "2024-06-20T17:00:00",
    location: "Downtown Arts District",
    description: "Explore local galleries and street art. Meet the artists and enjoy live performances.",
    category: "Art",
    price: "Free",
    imageUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000",
    attendees: 300,
    coordinates: { lat: 30.2700, lng: -97.7400 },
    organizerId: "v-2",
    status: "Confirmed",
    organizer: "Gourmet Delights",
    gallery: [
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  // --- Food & Drink ---
  {
    id: "e-4",
    title: "Austin Food Truck Crawl",
    date: "2024-07-20T12:00:00",
    location: "South Congress Ave",
    description: "Taste the best local eats from over 20 food trucks. Tacos, BBQ, vegan treats, and more!",
    category: "Food",
    price: "₹1500",
    imageUrl: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80&w=1000",
    attendees: 500,
    coordinates: { lat: 30.24, lng: -97.75 },
    organizerId: "v-2",
    status: "Confirmed",
    organizer: "Austin Eats",
    gallery: [
      "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "e-5",
    title: "Wine & Jazz Night",
    date: "2024-08-05T19:00:00",
    location: "The Vineyard Club",
    description: "An elegant evening of fine wine tasting accompanied by smooth live jazz.",
    category: "Food",
    price: "₹4500",
    imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000",
    attendees: 150,
    coordinates: { lat: 30.29, lng: -97.80 },
    organizerId: "v-1",
    status: "Confirmed",
    organizer: "Acme Events",
    gallery: [
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=1000"
    ]
  },

  // --- Adventure & Outdoor ---
  {
    id: "e-6",
    title: "Sunset Kayaking",
    date: "2024-06-25T18:30:00",
    location: "Lady Bird Lake",
    description: "Paddle through the heart of the city as the sun sets. Beginners welcome!",
    category: "Adventure",
    price: "₹2000",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a8723ba3f9?auto=format&fit=crop&q=80&w=1000",
    attendees: 50,
    coordinates: { lat: 30.26, lng: -97.73 },
    organizerId: "v-5", // Mock ID
    status: "Confirmed",
    organizer: "Outdoor life",
    gallery: [
      "https://images.unsplash.com/photo-1544551763-46a8723ba3f9?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1623945233682-1e967520e118?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1504280506541-aca1d6c88827?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "e-7",
    title: "Rock Climbing Workshop",
    date: "2024-07-10T08:00:00",
    location: "Greenbelt Cliffs",
    description: "Learn the basics of outdoor rock climbing with certified instructors.",
    category: "Adventure",
    price: "₹3500",
    imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=1000",
    attendees: 30,
    coordinates: { lat: 30.25, lng: -97.82 },
    organizerId: "v-5",
    status: "Confirmed",
    organizer: "Climb On",
    gallery: [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1601226065684-25626a57c13a?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1506198184128-4ad019d08643?auto=format&fit=crop&q=80&w=1000"
    ]
  },

  // --- Romantic ---
  {
    id: "e-8",
    title: "Rooftop Dinner under Stars",
    date: "2024-10-14T20:00:00",
    location: "Skyline Lounge",
    description: "A romantic 5-course dinner with breathtaking city views. Perfect for couples.",
    category: "Romantic",
    price: "₹8000",
    imageUrl: "https://images.unsplash.com/photo-1519671482538-518b5c2bf1c6?auto=format&fit=crop&q=80&w=1000",
    attendees: 40,
    coordinates: { lat: 30.265, lng: -97.745 },
    organizerId: "v-1",
    status: "Confirmed",
    organizer: "Elite Dates",
    gallery: [
      "https://images.unsplash.com/photo-1519671482538-518b5c2bf1c6?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000"
    ]
  },

  // --- Party & Nightlife ---
  {
    id: "e-9",
    title: "Neon Night Rave",
    date: "2024-07-28T22:00:00",
    location: "Warehouse District",
    description: "Electrifying beats, neon lights, and non-stop dancing until dawn.",
    category: "Party",
    price: "₹2500",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000",
    attendees: 2000,
    coordinates: { lat: 30.268, lng: -97.748 },
    organizerId: "v-4",
    status: "Confirmed",
    organizer: "Sound & Soul",
    gallery: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1000"
    ]
  },

  // --- Family ---
  {
    id: "e-10",
    title: "Family Fun Fair",
    date: "2024-09-01T10:00:00",
    location: "Central Park",
    description: "Games, rides, magic shows, and cotton candy for the whole family.",
    category: "Family",
    price: "₹500",
    imageUrl: "https://images.unsplash.com/photo-1533230408706-90e27db6422b?auto=format&fit=crop&q=80&w=1000",
    attendees: 600,
    coordinates: { lat: 30.30, lng: -97.72 },
    organizerId: "v-2",
    status: "Confirmed",
    organizer: "City Events",
    gallery: [
      "https://images.unsplash.com/photo-1533230408706-90e27db6422b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1473187983305-f615310e7daa?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1596464716127-f9a0859b4b1c?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "e-11",
    title: "Kids Science Magic",
    date: "2024-08-15T14:00:00",
    location: "Science Museum",
    description: "Interactive science experiments that feel like magic. Educational and fun!",
    category: "Family",
    price: "₹1200",
    imageUrl: "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?auto=format&fit=crop&q=80&w=1000",
    attendees: 200,
    coordinates: { lat: 30.28, lng: -97.73 },
    organizerId: "v-2",
    status: "Confirmed",
    organizer: "Discovery Kids",
    gallery: [
      "https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000"
    ]
  },

  // --- Social & Networking ---
  {
    id: "e-12",
    title: "Tech Founders Meetup",
    date: "2024-07-05T18:00:00",
    location: "Capital Factory",
    description: "Connect with startup founders, investors, and tech enthusiasts.",
    category: "Social",
    price: "Free",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000",
    attendees: 120,
    coordinates: { lat: 30.268, lng: -97.742 },
    organizerId: "v-1",
    status: "Confirmed",
    organizer: "Tech Austin",
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?auto=format&fit=crop&q=80&w=1000"
    ]
  }
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "v-1",
    name: "Acme Events",
    category: "Event Planning",
    rating: 4.9,
    priceRange: "₹₹₹",
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=500",
    verified: true
  },
  {
    id: "v-2",
    name: "Gourmet Delights",
    category: "Catering",
    rating: 4.8,
    priceRange: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=500",
    verified: true
  },
  {
    id: "v-3",
    name: "Capture Moments",
    category: "Photography",
    rating: 4.7,
    priceRange: "₹₹",
    imageUrl: "https://images.unsplash.com/photo-1452587925148-ce544ae55db9?auto=format&fit=crop&q=80&w=500",
    verified: false
  },
  {
    id: "v-4",
    name: "Sound & Soul",
    category: "Music",
    rating: 5.0,
    priceRange: "₹₹₹₹",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=500",
    verified: true
  }
];

export const DASHBOARD_DATA: DashboardMetric[] = [
  { name: "Venue", value: 1200000, color: "#4f46e5" },
  { name: "Catering", value: 850000, color: "#ec4899" },
  { name: "Decor", value: 300000, color: "#10b981" },
  { name: "Music", value: 100000, color: "#f59e0b" },
];

export const MOCK_TASKS = [];

// --- New Data for Roles ---

export const VENDOR_STATS = [
  { name: "Mon", income: 15000 },
  { name: "Tue", income: 22000 },
  { name: "Wed", income: 18000 },
  { name: "Thu", income: 45000 },
  { name: "Fri", income: 85000 },
  { name: "Sat", income: 120000 },
  { name: "Sun", income: 95000 },
];

export const MOCK_PACKAGES = {
  "v-1": [
    {
      id: "pkg-1",
      name: "Standard Wedding",
      price: "1,50,000",
      description: "Complete wedding planning including venue selection, catering coordination, and decor.",
      features: "Venue Selection, Catering, Basic Decor, Day-of Coordination"
    },
    {
      id: "pkg-2",
      name: "Premium Royal",
      price: "3,00,000",
      description: "Luxury wedding experience with premium venues, celebrity performers, and high-end catering.",
      features: "Luxury Venues, Celebrity Artists, Premium Catering, Full Styling"
    }
  ],
  "v-3": [
    {
      id: "pkg-3",
      name: "Gold Photography",
      price: "50,000",
      description: "Full day coverage with 2 photographers and a drone.",
      features: "Unlimited Photos, Drone Shots, Edited Album, 2 Photographers"
    }
  ],
  "v-4": [
    {
      id: "pkg-4",
      name: "Live Band Night",
      price: "25,000",
      description: "3-hour live performance with full sound setup.",
      features: "Live Band, Sound System, Lighting, 3 Hours"
    }
  ]
};

export const MOCK_SERVICES = {
  "v-1": [
    { id: "svc-1", title: "Full Wedding Planning", price: "50,000", description: "End-to-end planning service." },
    { id: "svc-2", title: "Day-of Coordination", price: "20,000", description: "On-site management for your big day." }
  ],
  "v-2": [
    { id: "svc-3", title: "Buffet Catering (Veg)", price: "800/plate", description: "Delicious vegetarian spread." },
    { id: "svc-4", title: "Premium Non-Veg Feast", price: "1200/plate", description: "Exquistie meat dishes and seafood." }
  ],
  "v-3": [
    { id: "svc-5", title: "Candid Photography", price: "40,000", description: "Capturing natural moments." },
    { id: "svc-6", title: "Cinematic Video", price: "60,000", description: "4K cinematic wedding film." }
  ],
  "v-4": [
    { id: "svc-7", title: "Live Band", price: "25,000", description: "3-piece band for reception." }
  ]
};
export const VENDOR_REQUESTS = [];

export const PLANNER_PROJECTS = [];

export const MOCK_BOOKINGS = [
  {
    eventId: "e-1",
    clientId: "u-client-demo", // Default client
    providerId: "v-1",
    serviceId: "s-1",
    status: "Confirmed",
    agreedPrice: 5000,
    scheduledStart: "2024-06-15T10:00:00Z",
    createdAt: new Date().toISOString()
  }
];

export const MOCK_CONTRACTS = [
  {
    id: "c-1",
    bookingId: "b-1",
    status: "Active",
    clauses: [
      { id: "cl-1", key: "deliverables", value: "Full event photography coverage", orderIndex: 1 },
      { id: "cl-2", key: "payment", value: "50% upfront, 50% on delivery", orderIndex: 2 }
    ]
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    participants: [
      { id: "u-current", name: "You", avatar: "" },
      { id: "v-1", name: "Acme Events", avatar: "https://ui-avatars.com/api/?name=Acme+Events&background=random" }
    ],
    lastMessage: {
      text: "Sure, we can discuss the contract details.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      senderId: "v-1"
    },
    unreadCount: 1
  },
  {
    id: "conv-2",
    participants: [
      { id: "u-current", name: "You", avatar: "" },
      { id: "p-1", name: "Sarah Planner", avatar: "https://ui-avatars.com/api/?name=Sarah+Planner&background=random" }
    ],
    lastMessage: {
      text: "I've updated the timeline.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      senderId: "u-current"
    },
    unreadCount: 0
  }
];

export const MOCK_DIRECT_MESSAGES: DirectMessage[] = [
  {
    id: "m-1",
    conversationId: "conv-1",
    senderId: "u-current",
    text: "Hi, are you available for the 15th?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: "text"
  },
  {
    id: "m-2",
    conversationId: "conv-1",
    senderId: "v-1",
    text: "Yes, we are open on that date.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    type: "text"
  },
  {
    id: "m-3",
    conversationId: "conv-1",
    senderId: "v-1",
    text: "Sure, we can discuss the contract details.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: "text"
  }
];
