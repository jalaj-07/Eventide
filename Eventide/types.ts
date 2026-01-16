export enum UserRole {
  CLIENT = "CLIENT",
  PLANNER = "PLANNER",
  VENDOR = "VENDOR",
  ADMIN = "ADMIN",
}

export interface User {
  id: string; // Maps to user_id
  name: string; // derived from first_name + last_name
  role: UserRole;
  avatar: string; // profile_picture_url
  email?: string;
  loginId?: string; // Legacy/Auth specific
  password?: string; // password_hash (in real app, never store plain)

  // Schema Alignments
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: "Active" | "Suspended" | "Deactivated";
  emailVerified?: boolean;
  createdAt?: string;

  // Relations
  providerProfile?: ProviderProfile;
  interests?: string[];
}

export interface ProviderProfile {
  providerId: string; // FK to users
  businessName?: string;
  businessDescription?: string;
  websiteUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  serviceArea?: string;
  priceRange?: "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹";
  yearsOfExperience?: number;
  verified?: boolean;
  rating?: number;
  coverPhotoUrl?: string;
  providerType: "PLANNER" | "VENDOR";
  kycData?: VendorKYC | PlannerKYC;
  reviews?: Review[];
  portfolio?: PortfolioItem[];
  services?: ServiceOffering[];
  packages?: EventPackage[];
}

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  price: number;
  pricingUnit: string; // "per hour", "per plate", "flat fee"
}

export interface EventPackage {
  id: string; // package_id
  name: string;
  description: string;
  price: number;
  features: string[];
}

export interface Review {
  id: string;
  providerId: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  rating: number; // 1-5
  text: string;
  timestamp: string;
  mediaUrls?: string[]; // Optional photos/videos
}

export interface VendorKYC {
  // Section 1: Basic & Business
  businessName: string;
  mobile: string;
  email: string;
  city: string;
  serviceArea: string;
  description: string;

  // Section 2: Legal & Identity
  panCardNo: string;
  businessRegistrationNo: string; // Udyam/MSME
  gstNo?: string;
  aadharCardNo: string;

  // Section 3: Banking
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  cancelledChequeUrl: string;

  // Section 4: Policies
  termsAccepted: boolean;
  cancellationPolicy: string;
  platformCommissionAccepted: boolean;
}

export interface PlannerKYC {
  // Section 1: Basic & Professional
  agencyName: string;
  ownerName: string;
  mobile: string;
  email: string;
  city: string;
  serviceLocations: string;
  yearsExperience: number;

  // Section 2: Legal & Identity
  isAgency: boolean;
  panCardNo: string;
  aadharCardNo: string;
  businessRegistrationNo?: string; // Optional if not agency
  gstNo: string;
  policeVerificationUrl: string;
  coreTeamIdUrl?: string; // Mandatory if agency
  noCriminalRecordDeclared: boolean;

  // Section 3: Banking
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  cancelledChequeUrl: string;

  // Section 4: Policies
  termsAccepted: boolean;
  serviceLevelAgreementAccepted: boolean;
  paymentRulesAccepted: boolean;
  cancellationPolicy: string;
}

export interface Event {
  id: string; // event_id
  title: string; // event_name
  description: string;
  date: string; // event_date
  location: string; // event_location_name
  imageUrl: string;
  attendees: number;
  category: "Music" | "Tech" | "Social" | "Wedding" | "Art" | "Food" | "Adventure" | "Romantic" | "Family" | "Party";
  gallery?: string[];

  // Schema Alignments
  clientId?: string;
  plannerId?: string;
  organizerId?: string;
  status: "Planning" | "Confirmed" | "Completed" | "Cancelled";
  budget?: number;
  address?: string;
  city?: string;
  timezone?: string;
  createdAt?: string;

  // Legacy compatibility
  organizer: string;
  organizerContact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  price?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Vendor {
  // Legacy Interface for UI compatibility - mapped to ProviderProfile in backend
  id: string;
  name: string;
  category: string;
  rating: number;
  priceRange: string;
  imageUrl: string;
  verified: boolean;
  serviceCount?: number;
  eventCount?: number;
}

// --- New Schema Modules ---

export interface Booking {
  id: string; // booking_id
  eventId: string;
  providerId: string;
  serviceId: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled" | "Declined";
  scheduledStart?: string;
  scheduledEnd?: string;
  agreedPrice: number;
  createdAt?: string;
}

export interface Contract {
  id: string; // contract_id
  bookingId: string;
  status: "Draft" | "Pending_Signatures" | "Active" | "Completed" | "Cancelled";
  clauses?: ContractClause[];
  signatures?: ContractSignature[];
}

export interface ContractClause {
  id: string;
  key: string; // deliverables, price, timeline
  value: string;
  orderIndex: number;
}

export interface ContractSignature {
  userId: string;
  signedAt: string;
  digitalHash: string;
}

export interface Payment {
  id: string; // payment_id
  bookingId?: string;
  providerId?: string; // Direct link to vendor/organizer (e.g. for Tickets)
  amount: number;
  currency: "USD" | "INR" | "EUR";
  status: "Pending" | "Succeeded" | "Failed" | "Refunded";
  method: "Card" | "UPI" | "EMI" | "Wallet" | "Bank Transfer";
  paymentDate?: string;
  receiptUrl?: string;

  // Method Specific Details (Optional for history/display)
  cardDetails?: {
    last4: string;
    network: string; // Visa, MasterCard
  };
  upiDetails?: {
    vpa: string;
    transactionRef: string;
  };
  emiDetails?: {
    bank: string;
    tenureMonths: number;
    monthlyAmount: number;
    interestRate: number;
  };
}

export interface PortfolioAlbum {
  id: string; // album_id
  userId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  visibility: "Public" | "Private" | "Unlisted";
  items?: PortfolioItem[];
}

export interface PortfolioItem {
  id: string; // item_id
  albumId: string;
  mediaType: "Image" | "Video";
  mediaUrl: string;
  title?: string;
  description?: string;
}

// --- Chat & Realtime ---

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: Date;
}

export interface EventChatMessage {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface DashboardMetric {
  name: string;
  value: number;
  color: string;
}

// --- Direct Messaging ---

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  lastMessage: {
    text: string;
    timestamp: string;
    senderId: string;
  };
  unreadCount: number;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text" | "video_call_start" | "video_call_end";
}
