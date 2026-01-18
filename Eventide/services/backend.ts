import { User, UserRole, Event, Vendor, EventChatMessage, Review, PortfolioItem, Payment } from "../types";
import {
  MOCK_EVENTS,
  MOCK_VENDORS,
  MOCK_BOOKINGS,
  MOCK_CONTRACTS,
  MOCK_CONVERSATIONS,
  MOCK_DIRECT_MESSAGES,
  PLANNER_PROJECTS,
  MOCK_PACKAGES,
  MOCK_SERVICES,
  DASHBOARD_DATA,
  VENDOR_STATS
} from "./mockData";

// --- Database Configuration ---

const DB_KEYS = {
  USERS: "eventide_users_v2",
  EVENTS: "eventide_events_v2",
  VENDORS: "eventide_vendors_v2",
  SESSION: "eventide_session_v2",
  // New mutable collections
  VENDOR_DATA: "eventide_vendor_data_v2", // Stats & Requests
  PLANNER_DATA: "eventide_planner_data_v2", // Projects & Alerts
  CLIENT_DATA: "eventide_client_data_v2", // Tasks, Budget & RSVPs
  EVENT_CHATS: "eventide_event_chats_v2", // Chat messages per event
  CLIENT_PLANS: "eventide_client_plans_v2", // Private plans
  SHARED_BOOKINGS: "eventide_shared_bookings_v2", // Shared bookings between Client & Vendor
  SHARED_PROJECTS: "eventide_shared_projects_v2", // Shared projects between Client & Planner
  CONVERSATIONS: "eventide_conversations_v2",
  DIRECT_MESSAGES: "eventide_direct_messages_v2",
  REVIEWS: "eventide_reviews_v2",
  PORTFOLIOS: "eventide_portfolios_v2",
  PAYMENTS: "eventide_payments_v2",
  SERVICES: "eventide_services_v2",
  PACKAGES: "eventide_packages_v2",
  GUESTS: "eventide_guests_v2",
};

const CHANNEL_NAME = "eventide_realtime_sync";

// --- Realtime Engine ---

class RealtimeEngine {
  private channel: BroadcastChannel;
  private listeners: Map<string, Function[]>;

  constructor() {
    this.channel = new BroadcastChannel(CHANNEL_NAME);
    this.listeners = new Map();

    // Listen for messages from other tabs
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      this.notifyLocalListeners(type, payload);
    };
  }

  // Subscribe to updates for a specific event type
  subscribe(eventType: string, callback: (payload: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);

    // Return unsubscribe function
    return () => {
      const list = this.listeners.get(eventType);
      if (list) {
        this.listeners.set(
          eventType,
          list.filter((cb) => cb !== callback)
        );
      }
    };
  }

  // Publish event to local listeners AND other tabs
  publish(eventType: string, payload: any) {
    this.notifyLocalListeners(eventType, payload);
    this.channel.postMessage({ type: eventType, payload });
  }

  private notifyLocalListeners(eventType: string, payload: any) {
    const list = this.listeners.get(eventType);
    if (list) {
      list.forEach((cb) => cb(payload));
    }
  }
}

const realtime = new RealtimeEngine();

// --- Backend Implementation ---

const getFromDB = (key: string, defaultVal: any) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultVal;
};

const saveToDB = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const Backend = {
  // Initialize DB with seed data if empty
  init: () => {
    // Static Data & Migration Check
    const existingUsers = getFromDB(DB_KEYS.USERS, []);
    const existingEvents = getFromDB(DB_KEYS.EVENTS, []);
    const existingVendors = getFromDB(DB_KEYS.VENDORS, []);

    // Seed Users
    // Check if re-seed needed (missing password or missing email for vendor)
    const needsReseed = existingUsers.length === 0;

    if (needsReseed) {
      const SEED_USERS: User[] = [];
      saveToDB(DB_KEYS.USERS, SEED_USERS);
      localStorage.removeItem(DB_KEYS.SESSION); // Clear stale session on re-seed
    }

    // Ensure specific client user exists
    const usersForClientCheck = getFromDB(DB_KEYS.USERS, []);
    if (!usersForClientCheck.find((u: User) => u.email === "client@eventide.com")) {
      usersForClientCheck.push({
        id: "u-client-demo",
        name: "Eventide Client",
        email: "client@eventide.com",
        password: "password@123",
        role: UserRole.CLIENT,
        avatar: "https://ui-avatars.com/api/?name=Eventide+Client&background=random",
        interests: [],
      });
      saveToDB(DB_KEYS.USERS, usersForClientCheck);
    }

    // Force Re-seed if data count is low (User has old mock data)
    if (existingEvents.length < 5) {
      saveToDB(DB_KEYS.EVENTS, MOCK_EVENTS);
    }
    if (existingVendors.length < 5) {
      saveToDB(DB_KEYS.VENDORS, MOCK_VENDORS);
    }

    // Mutable Dashboard Data (Seeding)
    // Mutable Dashboard Data (Seeding with Fresh Stats)
    let vData = getFromDB(DB_KEYS.VENDOR_DATA, null);
    if (!vData) {
      saveToDB(DB_KEYS.VENDOR_DATA, {
        stats: VENDOR_STATS, // Use fresh mock stats
        requests: [],
        metrics: { revenue: 0, bookings: 0, views: 0 },
        availability: [],
      });
    } else {
      // Force update stats if they are empty (fix for existing users)
      if (!vData.stats || vData.stats.length === 0 || vData.stats[0].income === 0) {
        vData.stats = VENDOR_STATS;
        saveToDB(DB_KEYS.VENDOR_DATA, vData);
      }
      // Ensure availability field exists
      if (!vData.availability) {
        vData.availability = [];
        saveToDB(DB_KEYS.VENDOR_DATA, vData);
      }
    }

    if (!localStorage.getItem(DB_KEYS.PLANNER_DATA)) {
      saveToDB(DB_KEYS.PLANNER_DATA, {
        projects: [],
        alerts: [],
      });
    }

    let cData = getFromDB(DB_KEYS.CLIENT_DATA, null);
    if (!cData) {
      saveToDB(DB_KEYS.CLIENT_DATA, {
        metrics: DASHBOARD_DATA, // Use fresh mock metrics
        tasks: [],
        rsvps: {},
      });
    } else {
      // Force update metrics if empty or zeroed (fix for existing users)
      if (!cData.metrics || cData.metrics.length === 0 || cData.metrics[0].value === 0) {
        cData.metrics = DASHBOARD_DATA;
        saveToDB(DB_KEYS.CLIENT_DATA, cData);
      }
    }

    // Seed Shared Bookings (New Schema)
    if (!localStorage.getItem(DB_KEYS.SHARED_BOOKINGS)) {
      saveToDB(DB_KEYS.SHARED_BOOKINGS, MOCK_BOOKINGS);
    }

    // Seed Contracts (New Schema)
    if (!localStorage.getItem("eventide_contracts_v2")) {
      saveToDB("eventide_contracts_v2", MOCK_CONTRACTS);
    }

    // Seed Shared Projects
    if (!localStorage.getItem(DB_KEYS.SHARED_PROJECTS)) {
      saveToDB(DB_KEYS.SHARED_PROJECTS, PLANNER_PROJECTS);
    }


    // Seed some chat messages
    if (!localStorage.getItem(DB_KEYS.EVENT_CHATS)) {
      saveToDB(DB_KEYS.EVENT_CHATS, {});
    }

    if (!localStorage.getItem(DB_KEYS.CONVERSATIONS)) {
      saveToDB(DB_KEYS.CONVERSATIONS, MOCK_CONVERSATIONS);
    }

    if (!localStorage.getItem(DB_KEYS.DIRECT_MESSAGES)) {
      saveToDB(DB_KEYS.DIRECT_MESSAGES, MOCK_DIRECT_MESSAGES);
    }
  },

  Auth: {
    login: async (
      role: UserRole,
      identifier: string,
      secret: string
    ): Promise<User> => {
      // Firebase Login
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth, db } = await import("./firebase");
      const { doc, getDoc } = await import("firebase/firestore");

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, identifier, secret);
      } catch (error: any) {
        // FALLBACK FOR MOBILE/NETWORK TESTING
        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/network-request-failed') {
          console.warn("Using Mock Login due to Firebase Error:", error.code);
          await new Promise(r => setTimeout(r, 800)); // Sim delay

          const mockId = role === UserRole.VENDOR ? "v-1" : "u-client-demo";
          const mockName = role === UserRole.VENDOR ? "Acme Events" : "Eventide Client";

          const user: User = {
            id: mockId,
            name: mockName,
            email: identifier,
            role: role,
            avatar: "https://ui-avatars.com/api/?name=" + mockName,
            interests: [],
            createdAt: new Date().toISOString()
          };
          localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
          return user;
        }
        throw error;
      }
      const uid = userCredential.user.uid;

      // Fetch User Profile from Firestore
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      let userData: User;

      if (!userDoc.exists()) {
        // Auto-heal: Create missing profile if Auth exists but DB doc is missing
        // This happens if a previous signup failed midway
        const fbUser = userCredential.user;
        const newUser: User = {
          id: uid,
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          role: role, // Use the role they are trying to login as
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}`,
          interests: [],
          createdAt: new Date().toISOString(),
        };

        // Save the recovered profile
        const { setDoc } = await import("firebase/firestore");
        await setDoc(userDocRef, newUser);
        userData = newUser;
      } else {
        userData = userDoc.data() as User;
      }

      // Role Validation (Optional: Strict Mode)
      if (userData.role !== role) {
        throw new Error(`Incorrect role. This account is registered as a ${userData.role}`);
      }

      // Add ID just in case
      const user: User = { ...userData, id: uid };
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
      return user;
    },

    loginWithGoogle: async (): Promise<User> => {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, db, googleProvider } = await import("./firebase");
      const { doc, getDoc, setDoc } = await import("firebase/firestore");

      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userDocRef);

      let user: User;

      if (userDoc.exists()) {
        user = userDoc.data() as User;
        user.id = fbUser.uid;
      } else {
        // Create new Client user for Google Sign-In
        const newUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          role: UserRole.CLIENT, // Default to client for Google Sign-In
          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${fbUser.displayName || 'User'}`,
          createdAt: new Date().toISOString(),
          interests: [],
        };

        // Initialize Provider Profile for Vendors/Planners immediately (if role was somehow set)
        if (newUser.role === UserRole.VENDOR || newUser.role === UserRole.PLANNER) {
          newUser.providerProfile = {
            providerId: newUser.id,
            businessName: newUser.name,
            providerType: newUser.role,
            verified: false,
            rating: 0,
            priceRange: "₹₹"
          };
        }

        await setDoc(doc(db, "users", newUser.id), newUser);
        // No updateProfile needed for Google sign-in as display name/photo are from Google

        // Save to LocalStorage for session
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(newUser));

        // Also update the local USERS list for immediate visibility in hybrid mode
        const localUsers = getFromDB(DB_KEYS.USERS, []);
        // Check if already exists (shouldn't, but for safety)
        const idx = localUsers.findIndex((u: User) => u.id === newUser.id);
        if (idx !== -1) {
          localUsers[idx] = newUser;
        } else {
          localUsers.push(newUser);
        }
        saveToDB(DB_KEYS.USERS, localUsers);

        user = newUser; // Assign newUser to user for the return statement
      }

      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
      return user;
    },

    register: async (userProfile: Partial<User>): Promise<User> => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth, db } = await import("./firebase");
      const { doc, setDoc } = await import("firebase/firestore");

      if (!userProfile.email || !userProfile.password || !userProfile.name) {
        throw new Error("Please fill in all required fields.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userProfile.email, userProfile.password);
      const fbUser = userCredential.user;

      await updateProfile(fbUser, {
        displayName: userProfile.name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`
      });

      const newUser: User = {
        id: fbUser.uid,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role || UserRole.CLIENT,
        avatar: fbUser.photoURL || "",
        interests: [],
        createdAt: new Date().toISOString(),
      };

      // Auto-initialize profile for Vendors/Planners if not provided
      if ((newUser.role === UserRole.VENDOR || newUser.role === UserRole.PLANNER) && !userProfile.providerProfile) {
        newUser.providerProfile = {
          providerId: fbUser.uid,
          businessName: newUser.name,
          providerType: newUser.role,
          verified: false,
          rating: 0,
          priceRange: "₹₹"
        };
      } else if (userProfile.providerProfile) {
        newUser.providerProfile = {
          ...userProfile.providerProfile,
          providerId: fbUser.uid
        };
      }

      // Save to Firestore
      const userToSave = JSON.parse(JSON.stringify(newUser));
      await setDoc(doc(db, "users", fbUser.uid), userToSave);

      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(newUser));

      // Also update the local USERS list for immediate visibility in hybrid mode
      const localUsers = getFromDB(DB_KEYS.USERS, []);
      const idx = localUsers.findIndex((u: User) => u.id === newUser.id);
      if (idx !== -1) {
        localUsers[idx] = newUser;
      } else {
        localUsers.push(newUser);
      }
      saveToDB(DB_KEYS.USERS, localUsers);

      return newUser;
    },

    logout: async () => {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("./firebase");
      await signOut(auth);
      localStorage.removeItem(DB_KEYS.SESSION);
    },

    getSession: (): User | null => {
      const session = localStorage.getItem(DB_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    },

    // Listen for auth state changes (used in App.tsx)
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      import("./firebase").then(({ auth, db }) => {
        import("firebase/auth").then(({ onAuthStateChanged }) => {
          import("firebase/firestore").then(({ doc, getDoc }) => {
            return onAuthStateChanged(auth, async (fbUser) => {
              if (fbUser) {
                // Fetch full profile
                const userDoc = await getDoc(doc(db, "users", fbUser.uid));
                if (userDoc.exists()) {
                  const user = { ...userDoc.data(), id: fbUser.uid } as User;
                  localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(user));
                  callback(user);
                } else {
                  // User authenticated but no profile? Should rare.
                  callback(null);
                }
              } else {
                localStorage.removeItem(DB_KEYS.SESSION);
                callback(null);
              }
            });
          });
        });
      });
    },

    recoverPassword: async (identifier: string): Promise<void> => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("./firebase");
      if (!identifier) throw new Error("Please enter your email.");
      await sendPasswordResetEmail(auth, identifier);
    },

    updateProfile: async (
      userId: string,
      updates: Partial<User>
    ): Promise<User> => {
      const { db } = await import("./firebase");
      const { doc, updateDoc, getDoc } = await import("firebase/firestore");

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updates);

      const updatedSnap = await getDoc(userRef);
      const updatedUser = { ...updatedSnap.data(), id: userId } as User;

      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(updatedUser)); // Sync Session
      return updatedUser;
    },

    updateProviderProfile: async (userId: string, profileUpdates: any) => {
      const { db } = await import("./firebase");
      const { doc, getDoc, updateDoc } = await import("firebase/firestore");

      const userRef = doc(db, "users", userId);
      // We need to merge deep, but Firestore update is shallow on top fields.
      // So we read first or use dot notation if we knew exact fields.
      // Reading first is safer for complex object merging
      const snap = await getDoc(userRef);
      if (!snap.exists()) throw new Error("User not found");

      const userData = snap.data() as User;
      const newProviderProfile = { ...userData.providerProfile, ...profileUpdates };

      await updateDoc(userRef, { providerProfile: newProviderProfile });

      realtime.publish("CLIENT_UPDATE", {});
      return { ...userData, providerProfile: newProviderProfile };
    }
  },

  // --- Realtime Data Service ---
  API: {
    // 1. Generic Event Subscription
    subscribe: (
      channel: "VENDOR" | "PLANNER" | "CLIENT" | "CHAT" | "LOCATION" | "DM",
      callback: (data: any) => void
    ) => {
      return realtime.subscribe(`${channel}_UPDATE`, callback);
    },

    // 2. Client API
    getClientDashboard: async (userId?: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const clientData = getFromDB(DB_KEYS.CLIENT_DATA, { metrics: [], tasks: [], rsvps: {} });

      // 1. Calculate Real Budget & Graph from Bookings
      let allBookings = getFromDB(DB_KEYS.SHARED_BOOKINGS, []);
      if (allBookings.length === 0) {
        allBookings = MOCK_BOOKINGS; // Fallback to mock for demo
        saveToDB(DB_KEYS.SHARED_BOOKINGS, allBookings);
      }

      // FILTER BY USER ID (Data Isolation)
      const myBookings = allBookings.filter((b: any) => {
        // If booking has specific clientId, must match. 
        // If legacy/no clientId, we show it IF userId matches default demo user or just show for backward compat?
        // Strict: b.clientId === userId
        if (b.clientId) return b.clientId === userId;
        return userId === "u-client-demo"; // Legacy/Mock fallback
      }).filter((b: any) => ["accepted", "confirmed", "completed"].includes(b.status.toLowerCase()));

      const categoryTotals: Record<string, number> = {};
      let totalSpent = 0;

      myBookings.forEach((b: any) => {
        const cat = b.category || "General";
        const amount = Number(b.agreedPrice) || 0;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        totalSpent += amount;
      });

      // Format for Graph
      const graphMetrics = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
      }));

      // Fallback for empty graph (demo purpose)
      if (graphMetrics.length === 0) {
        // graphMetrics.push({ name: "Planned", value: 0 }); 
        // Or leave empty to show empty state, but for "Budget Allocation" likely better to show 0
      }

      // 2. Vendors Hired (Unique Providers)
      const uniqueVendors = new Set(myBookings.map((b: any) => b.providerId));
      const vendorsHired = uniqueVendors.size;

      // 3. Guests (Seed if empty)
      let guests = getFromDB(DB_KEYS.GUESTS, []);
      if (guests.length === 0) {
        // Seed with Default Guests
        guests = [
          { id: 1, name: "Sofia Davis", email: "sofia@davis.com", status: "Confirmed", table: "Table 5", type: "Family", avatar: "https://ui-avatars.com/api/?name=Sofia+Davis&background=random" },
          { id: 2, name: "Thomas Wilson", email: "tom.wilson@email.com", status: "Pending", table: "-", type: "Friend", avatar: "https://ui-avatars.com/api/?name=Thomas+Wilson&background=random" },
          { id: 3, name: "Eleanor Pena", email: "eleanor@work.com", status: "Confirmed", table: "Table 2", type: "Colleague", avatar: "https://ui-avatars.com/api/?name=Eleanor+Pena&background=random" },
          { id: 4, name: "Robert Fox", email: "r.fox@mail.com", status: "Declined", table: "-", type: "Family", avatar: "https://ui-avatars.com/api/?name=Robert+Fox&background=random" },
          { id: 5, name: "Cody Fisher", email: "cody.f@email.com", status: "Confirmed", table: "Table 1", type: "VIP", avatar: "https://ui-avatars.com/api/?name=Cody+Fisher&background=random" },
          { id: 6, name: "Bessie Cooper", email: "bessie@cooper.com", status: "Confirmed", table: "Table 5", type: "Family", avatar: "https://ui-avatars.com/api/?name=Bessie+Cooper&background=random" },
          { id: 7, name: "Wade Warren", email: "wade@warren.com", status: "Pending", table: "-", type: "Friend", avatar: "https://ui-avatars.com/api/?name=Wade+Warren&background=random" },
          { id: 8, name: "Guy Hawkins", email: "guy@hawkins.com", status: "Confirmed", table: "Table 2", type: "Colleague", avatar: "https://ui-avatars.com/api/?name=Guy+Hawkins&background=random" },
        ];
        saveToDB(DB_KEYS.GUESTS, guests);
      }
      const confirmedGuests = guests.filter((g: any) => g.status === "Confirmed").length;

      // 4. Tasks
      const pendingTasks = (clientData.tasks || []).filter((t: any) => t.status !== "Completed").length;

      const bookings = allBookings.filter((b: any) => { // List also needs filtering
        if (b.clientId) return b.clientId === userId;
        return userId === "u-client-demo";
      });

      const projects = getFromDB(DB_KEYS.SHARED_PROJECTS, []);

      return {
        metrics: graphMetrics, // Replaces static 'data.metrics'
        totalSpent,
        confirmedGuests,
        vendorsHired,
        pendingTasks,

        upcomingTasks: clientData.tasks || [],
        rsvps: clientData.rsvps,
        bookings,
        projects,
        guests // Return guests for the list UI
      };
    },

    getUser: async (id: string): Promise<User | null> => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const users = getFromDB(DB_KEYS.USERS, []);
      const user = users.find((u: User) => u.id === id);
      return user || null;
    },

    updateRsvp: async (
      eventId: string,
      status: "attending" | "interested" | null
    ) => {
      const data = getFromDB(DB_KEYS.CLIENT_DATA, {
        metrics: [],
        tasks: [],
        rsvps: {},
      });
      if (!data.rsvps) data.rsvps = {}; // Safety check for legacy data

      if (status === null) {
        delete data.rsvps[eventId];
      } else {
        data.rsvps[eventId] = status;
      }
      saveToDB(DB_KEYS.CLIENT_DATA, data);
      realtime.publish("CLIENT_UPDATE", data);
      return data.rsvps;
    },

    addTask: async (taskTitle: string) => {
      const data = getFromDB(DB_KEYS.CLIENT_DATA, {});
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        status: "Pending",
        date: "Today",
      };
      data.tasks = [newTask, ...data.tasks];
      saveToDB(DB_KEYS.CLIENT_DATA, data);
      realtime.publish("CLIENT_UPDATE", data); // Notify listeners
      return newTask;
    },

    createPlan: async (plan: { eventId: string; name: string; friends: string[] }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const plans = getFromDB(DB_KEYS.CLIENT_PLANS, []);
      const newPlan = {
        id: `plan-${Date.now()}`,
        ...plan,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      plans.push(newPlan);
      saveToDB(DB_KEYS.CLIENT_PLANS, plans);
      // Simplify: Client dashboard will pull this
      return newPlan;
    },

    getPlans: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return getFromDB(DB_KEYS.CLIENT_PLANS, []);
    },

    // Location API
    updateLocation: (eventId: string, user: User, lat: number, lng: number) => {
      // Ephemeral update, no persistence needed for this simple demo
      realtime.publish("LOCATION_UPDATE", {
        eventId,
        userId: user.id,
        userAvatar: user.avatar,
        lat,
        lng,
      });
    },

    // 3. Vendor API
    incrementVendorViews: async (_vendorId: string) => {
      const data = getFromDB(DB_KEYS.VENDOR_DATA, {});
      const views = (data.metrics?.views || 0) + 1;

      const newData = {
        ...data,
        metrics: {
          ...data.metrics,
          views: views
        }
      };

      saveToDB(DB_KEYS.VENDOR_DATA, newData);
      realtime.publish("VENDOR_UPDATE", newData);
      return views;
    },

    getVendorDashboard: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const rawData = getFromDB(DB_KEYS.VENDOR_DATA, {});

      // Calculate Real Metrics from Shared Bookings
      const allBookings = getFromDB(DB_KEYS.SHARED_BOOKINGS, []);
      // Filter for this mock vendor "v1" (Mock ID used in VendorDashboard) or dynamic ID if we had context
      // For demo purposes, we will assume the logged in vendor is "v-1" (Acme Events) as defined in mockData
      const VENDOR_ID = "v-1";

      const myBookings = allBookings.filter((b: any) => b.providerId === VENDOR_ID || b.vendorId === VENDOR_ID);

      // 1. Revenue: Sum of agreedPrice for Accepted/Confirmed bookings
      const revenue = myBookings
        .filter((b: any) => ["accepted", "confirmed", "completed"].includes(b.status.toLowerCase()))
        .reduce((sum: number, b: any) => sum + (Number(b.agreedPrice) || 0), 0);

      // 2. Active Bookings
      const activeBookingsCount = myBookings.filter((b: any) => ["pending", "accepted", "confirmed"].includes(b.status.toLowerCase())).length;

      // 3. Generate Graph Data (Weekly Earnings)
      // Group revenue by day of week for the current week or just aggregate all time for the demo graph
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Initialize with 0 or keep existing mock stats if no real data to prevent empty graph
      // If we have real revenue, we use real graph. If 0 revenue, we keep the interesting mock graph for demo.
      let stats = rawData.stats || [];

      if (revenue > 0) {
        // Reset stats to 0-filled week
        stats = days.map(d => ({ name: d, income: 0 }));

        myBookings.forEach((b: any) => {
          if (["accepted", "confirmed", "completed"].includes(b.status.toLowerCase())) {
            const date = new Date(b.scheduledStart || b.createdAt); // Use event date
            // Check if it's recent (e.g., this week)? For demo, we just map day of week
            const dayName = days[date.getDay()];
            const existing = stats.find((s: any) => s.name === dayName);
            if (existing) {
              existing.income += (Number(b.agreedPrice) || 0);
            }
          }
        });
        // Re-sort stats to start from Mon (optional, depending on UI preference)
        // UI shows Mon-Sun usually.
        const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        stats.sort((a: any, b: any) => ordered.indexOf(a.name) - ordered.indexOf(b.name));
      }

      const requests = myBookings.filter((b: any) => b.status === "pending" || b.status === "Pending");

      const defaultData = {
        metrics: {
          bookings: activeBookingsCount,
          revenue: revenue,
          rating: 5.0,
          views: rawData.metrics?.views || 142 // Fallback to mock base if 0
        },
        stats: stats,
        availability: [],
        requests: requests
      };

      // Merge availability from rawData
      const finalData = { ...defaultData, availability: rawData.availability || [] };

      return finalData;
    },

    updateVendorAvailability: async (blockedDates: string[]) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = getFromDB(DB_KEYS.VENDOR_DATA, {});
      data.availability = blockedDates;
      saveToDB(DB_KEYS.VENDOR_DATA, data);
      realtime.publish("VENDOR_UPDATE", data);
      return data;
    },

    getVendors: async (): Promise<Vendor[]> => {
      // 1. Fetch Mock Vendors (Legacy)
      const mockVendors = getFromDB(DB_KEYS.VENDORS, MOCK_VENDORS);

      // 2. Fetch Real Vendors/Planners from Firestore
      const { db } = await import("./firebase");
      const { collection, getDocs, query, where } = await import("firebase/firestore");

      // 1. Get Local Storage Vendors (for "My Profile" visibility)
      const localUsers = getFromDB(DB_KEYS.USERS, []);
      const localVendors = localUsers
        .filter((u: User) => (u.role === UserRole.VENDOR || u.role === UserRole.PLANNER) && u.providerProfile)
        .map((u: User) => {
          const profile = u.providerProfile!;
          return {
            id: u.id,
            name: profile.businessName || u.name,
            category: profile.providerType === "PLANNER" ? "Planners" : "Vendor",
            rating: profile.rating || 5.0,
            priceRange: profile.priceRange || "₹₹",
            imageUrl: profile.coverPhotoUrl || u.avatar || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=500",
            verified: profile.verified || false
          } as Vendor;
        });

      const usersRef = collection(db, "users");
      // Firestore doesn't support logical OR in simple queries easily without composite indexes or multiple queries.
      // We will fetch all users for now (assuming low volume) or make two queries. 
      // Optimization: For now, fetching all users and filtering client-side is acceptable for MVP.
      // Ideally: where("role", "in", ["VENDOR", "PLANNER"])

      const q = query(usersRef, where("role", "in", ["VENDOR", "PLANNER"]));

      try {
        const snapshot = await getDocs(q);

        const realVendors = snapshot.docs.map(doc => {
          const u = doc.data() as User;
          if (!u.providerProfile) return null;

          const profile = u.providerProfile;
          const avgRating = profile.rating || 5.0;

          return {
            id: doc.id,
            name: profile.businessName || u.name,
            category: profile.providerType === "PLANNER"
              ? "Planners"
              : (profile.businessDescription ? "General" : "Vendor"),
            rating: avgRating,
            priceRange: profile.priceRange || "₹₹",
            imageUrl: profile.coverPhotoUrl || u.avatar || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=500",
            verified: profile.verified || false
          } as Vendor;
        }).filter(v => v !== null) as Vendor[];

        // Deduplicate based on ID (prefer Firestore > Local > Mock)
        const allVendors = [...realVendors, ...localVendors, ...mockVendors];
        const uniqueVendors = Array.from(new Map(allVendors.map(v => [v.id, v])).values());

        // Enrich with Service and Event Counts
        // Note: In a real app, this would be an expensive N+1 query or need an index/counter on the user doc.
        // For MVP with local storage, iterating is fine.
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        const allEvents = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);

        // Firestore events not included here for count unless we fetch them all... 
        // Let's assume we want to show counts for what we have.
        // Actually, we must use Backend.API.getEvents() if we want real totals, but that might be circular or slow.
        // We will stick to local/mock for now as a "preview" enhancement.

        const enrichedVendors = uniqueVendors.map((v: Vendor) => {
          const sCount = (allServices[v.id] || []).length;
          // Events: match organizerId or providerId
          const eCount = allEvents.filter((e: any) => e.organizerId === v.id || e.providerId === v.id).length;

          return {
            ...v,
            serviceCount: sCount,
            eventCount: eCount
          };
        });

        return enrichedVendors;

      } catch (e) {
        console.error("Error fetching real vendors:", e);
        // Fallback to mock + local
        const allVendors = [...localVendors, ...mockVendors];
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        const allEvents = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);

        return allVendors.map((v: Vendor) => {
          const sCount = (allServices[v.id] || []).length;
          const eCount = allEvents.filter((e: any) => e.organizerId === v.id || e.providerId === v.id).length;
          return { ...v, serviceCount: sCount, eventCount: eCount };
        });
      }
    },

    // 8. Reviews API
    Reviews: {
      addReview: async (review: Omit<Review, "id" | "timestamp">): Promise<Review> => {
        const allReviews = getFromDB(DB_KEYS.REVIEWS, []);
        const newReview: Review = {
          ...review,
          id: `rev-${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        allReviews.push(newReview);
        saveToDB(DB_KEYS.REVIEWS, allReviews);

        // Notify vendor
        realtime.publish("VENDOR_UPDATE", {});
        return newReview;
      },

      getReviews: async (providerId: string): Promise<Review[]> => {
        const allReviews = getFromDB(DB_KEYS.REVIEWS, []);
        return allReviews.filter((r: Review) => r.providerId === providerId).sort((a: Review, b: Review) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
    },

    // 9. Portfolio API
    Portfolio: {
      addToPortfolio: async (providerId: string, item: Omit<PortfolioItem, "id">): Promise<PortfolioItem> => {
        const allPortfolios = getFromDB(DB_KEYS.PORTFOLIOS, {});
        // Structure: { providerId: [items] }
        const vendorItems = allPortfolios[providerId] || [];

        const newItem: PortfolioItem = {
          ...item,
          id: `port-${Date.now()}`,
          albumId: "default"
        };

        allPortfolios[providerId] = [newItem, ...vendorItems];
        allPortfolios[providerId] = [newItem, ...vendorItems];
        saveToDB(DB_KEYS.PORTFOLIOS, allPortfolios);
        realtime.publish("CLIENT_UPDATE", {}); // Notify clients (Portfolio update)
        return newItem;
      },

      getPortfolio: async (providerId: string): Promise<PortfolioItem[]> => {
        const allPortfolios = getFromDB(DB_KEYS.PORTFOLIOS, {});
        return allPortfolios[providerId] || [];
      },

      deleteItem: async (providerId: string, itemId: string) => {
        const allPortfolios = getFromDB(DB_KEYS.PORTFOLIOS, {});
        const vendorItems = allPortfolios[providerId] || [];
        allPortfolios[providerId] = vendorItems.filter((i: PortfolioItem) => i.id !== itemId);
        saveToDB(DB_KEYS.PORTFOLIOS, allPortfolios);
        realtime.publish("CLIENT_UPDATE", {});
      }
    },

    // 10. Payments API
    Payments: {
      createPayment: async (paymentData: Omit<Payment, "id" | "status" | "paymentDate">): Promise<Payment> => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing

        const allPayments = getFromDB(DB_KEYS.PAYMENTS, []);
        const isSuccess = Math.random() > 0.1; // 90% Success rate

        const newPayment: Payment = {
          ...paymentData,
          id: `pay-${Date.now()}`,
          status: isSuccess ? "Succeeded" : "Failed",
          paymentDate: new Date().toISOString()
        };

        if (isSuccess) {
          allPayments.push(newPayment);
          saveToDB(DB_KEYS.PAYMENTS, allPayments);

          // If connected to a booking, update booking status?
          // Ideally yes, but keeping it simple. We will update Booking status in handlePaymentSuccess on client/vendor side or here if we had full backend logic.
          if (paymentData.bookingId) {
            const bookings = getFromDB(DB_KEYS.SHARED_BOOKINGS, []);
            const bookingIdx = bookings.findIndex((b: any) => b.id === Number(paymentData.bookingId)); // Note: booking IDs are numbers in current mock
            if (bookingIdx !== -1) {
              // Could mark as "Paid" or "Confirmed" if it was pending payment
              // For now, we assume "Confirmed" means accepted, maybe we need a "Paid" status?
              // Let's just track the payment record for now.
            }
          }
        }

        if (!isSuccess) {
          throw new Error("Payment Failed");
        }

        // Notify Vendor
        realtime.publish("VENDOR_UPDATE", {});
        return newPayment;
      },

      getPayments: async (_userId: string): Promise<Payment[]> => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const allPayments = getFromDB(DB_KEYS.PAYMENTS, []);
        // In a real app, we need to know if userId is payer (Client) or payee (Vendor)
        // For this mock, we'll return all for now or filter if we can link booking->vendor

        // Filter logic: 
        // If Client: return payments where booking.clientId == userId (requires join)
        // If Vendor: return payments where booking.providerId == userId

        // Simplified:
        // Simplified:
        return allPayments;
      },

      getVendorPayments: async (vendorId: string): Promise<Payment[]> => {
        const allPayments = getFromDB(DB_KEYS.PAYMENTS, []);
        const bookings = getFromDB(DB_KEYS.SHARED_BOOKINGS, []);

        // Find bookings for this vendor
        const vendorBookingIds = bookings
          .filter((b: any) => b.providerId === vendorId) // Check if providerId matches
          .map((b: any) => String(b.id));

        return allPayments.filter((p: Payment) =>
          (p.bookingId && vendorBookingIds.includes(p.bookingId)) ||
          (p.providerId === vendorId)
        );
      }
    },

    respondToBooking: async (
      requestId: number,
      status: "accepted" | "declined"
    ) => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update Shared Booking
      const bookings = getFromDB(DB_KEYS.SHARED_BOOKINGS, []);
      const bookingIdx = bookings.findIndex((b: any) => b.id === requestId);

      if (bookingIdx !== -1) {
        bookings[bookingIdx].status = status;
        saveToDB(DB_KEYS.SHARED_BOOKINGS, bookings);
      }

      // Update Vendor Stats
      const data = getFromDB(DB_KEYS.VENDOR_DATA, {});

      if (status === "accepted") {
        data.metrics.bookings += 1;
        // Simulate revenue bump
        data.metrics.revenue += Math.floor(Math.random() * 2000) + 500;

        // Add to recent stats
        const today = new Date().toLocaleDateString("en-US", {
          weekday: "short",
        });
        const statIdx = data.stats.findIndex((s: any) => s.name === today);
        if (statIdx >= 0) {
          data.stats[statIdx].income += 1500;
        }
      }

      saveToDB(DB_KEYS.VENDOR_DATA, data);

      // Broadcast updates
      realtime.publish("VENDOR_UPDATE", { ...data, requests: bookings.filter((b: any) => b.status === 'pending') });
      realtime.publish("CLIENT_UPDATE", {}); // Trigger client refresh

      return data;
    },

    // 4. Planner API
    getPlannerDashboard: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const data = getFromDB(DB_KEYS.PLANNER_DATA, {});
      const projects = getFromDB(DB_KEYS.SHARED_PROJECTS, []);
      return { ...data, projects };
    },

    createProject: async (projectDetails: any) => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Update Shared Projects
      const projects = getFromDB(DB_KEYS.SHARED_PROJECTS, []);
      const newProject = {
        id: Date.now(),
        name: projectDetails.name,
        client: projectDetails.client,
        status: "Planning",
        progress: 0,
        date: projectDetails.date,
      };
      projects.unshift(newProject);
      saveToDB(DB_KEYS.SHARED_PROJECTS, projects);

      // Add a notification alert (Planner Local)
      const data = getFromDB(DB_KEYS.PLANNER_DATA, {});
      data.alerts = [
        {
          id: Date.now(),
          text: `New Project "${newProject.name}" started.`,
          time: "Just now",
          type: "success",
        },
        ...data.alerts,
      ];

      saveToDB(DB_KEYS.PLANNER_DATA, data);

      realtime.publish("PLANNER_UPDATE", { ...data, projects });
      realtime.publish("CLIENT_UPDATE", {}); // Trigger client sync
      return { ...data, projects };
    },

    // 5. Event Management (New)
    getEvent: async (id: string): Promise<Event | undefined> => {
      // 1. Check Mock/Local first
      const events = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);
      const localEvent = events.find((e: Event) => e.id === id);
      if (localEvent) return localEvent;

      // 2. Check Firestore
      try {
        const { db } = await import("./firebase");
        const { doc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "events", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { ...snap.data(), id: snap.id } as Event;
        }
      } catch (e) {
        console.error("Error fetching event:", e);
      }
      return undefined;
    },

    getEvents: async (): Promise<Event[]> => {
      // 1. Mock/Local Events
      const localEvents = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);

      // 2. Firestore Events
      try {
        const { db } = await import("./firebase");
        const { collection, getDocs } = await import("firebase/firestore");

        const eventsRef = collection(db, "events");
        const snapshot = await getDocs(eventsRef);

        const realEvents = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id
          };
        }) as Event[];

        console.log(`[Backend] Fetched ${realEvents.length} real events from Firestore.`);

        // Merge and Deduplicate
        const allEvents = [...realEvents, ...localEvents];
        const uniqueEvents = Array.from(new Map(allEvents.map(e => [e.id, e])).values());

        // Sort in memory
        return uniqueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } catch (e) {
        console.error("[Backend] Error loading events from Firestore:", e);
        return localEvents; // Fallback to just local
      }
    },

    updateEvent: async (id: string, updates: Partial<Event>) => {
      // Optimistic Local Update
      const events = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);
      const index = events.findIndex((e: Event) => e.id === id);
      if (index !== -1) {
        events[index] = { ...events[index], ...updates };
        saveToDB(DB_KEYS.EVENTS, events);
      }

      // Try Firestore
      try {
        const { db } = await import("./firebase");
        const { doc, updateDoc, getDoc } = await import("firebase/firestore");
        const docRef = doc(db, "events", id);
        await updateDoc(docRef, updates);
        const updated = await getDoc(docRef);
        return { ...updated.data(), id } as Event;
      } catch (e) {
        // Return local version if Firestore fails
        if (index !== -1) return events[index];
        throw e;
      }
    },

    cancelEvent: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Local Delete
      let events = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);
      events = events.filter((e: Event) => e.id !== id);
      saveToDB(DB_KEYS.EVENTS, events);

      // Try Firestore Delete (ignoring errors for MVP)
      try {
        const { db } = await import("./firebase");
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "events", id));
      } catch (e) { console.warn("Firestore delete failed", e); }
    },

    createEvent: async (eventData: Omit<Event, "id">) => {
      let newEvent: Event;

      // 1. Try Firestore First
      try {
        const { db } = await import("./firebase");
        const { collection, addDoc } = await import("firebase/firestore");

        const newEventData = {
          ...eventData,
          attendees: 0,
          createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, "events"), newEventData);
        newEvent = { ...newEventData, id: docRef.id } as Event;

      } catch (e) {
        console.error("Failed to create event in DB, falling back to local ID", e);
        newEvent = {
          ...eventData,
          attendees: 0,
          id: `e-${Date.now()}`,
          createdAt: new Date().toISOString()
        } as Event;
      }

      // 2. ALWAYS Save to Local Mirror
      // This ensures immediate visibility even if Firestore read is slow/broken
      const currentEvents = getFromDB(DB_KEYS.EVENTS, MOCK_EVENTS);
      const updatedEvents = [...currentEvents, newEvent];
      saveToDB(DB_KEYS.EVENTS, updatedEvents);

      realtime.publish("CLIENT_UPDATE", {}); // Notify clients
      return newEvent;
    },

    // 6. Chat API
    Chat: {
      getMessages: async (eventId: string): Promise<EventChatMessage[]> => {
        // No simulated delay for chat to feel snappy
        const allChats = getFromDB(DB_KEYS.EVENT_CHATS, {});
        return allChats[eventId] || [];
      },

      sendMessage: async (
        eventId: string,
        text: string
      ): Promise<EventChatMessage> => {
        const session = localStorage.getItem(DB_KEYS.SESSION);
        const user = session
          ? JSON.parse(session)
          : {
            id: "anon",
            name: "Anonymous",
            avatar: "https://ui-avatars.com/api/?name=A",
          };

        const allChats = getFromDB(DB_KEYS.EVENT_CHATS, {});
        const currentMessages = allChats[eventId] || [];

        const newMessage: EventChatMessage = {
          id: `msg-${Date.now()}`,
          eventId,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          text,
          timestamp: new Date().toISOString(),
        };

        allChats[eventId] = [...currentMessages, newMessage];
        saveToDB(DB_KEYS.EVENT_CHATS, allChats);

        // Publish update specifically for chat
        realtime.publish("CHAT_UPDATE", { eventId, message: newMessage });
        return newMessage;
      },
    },

    // Services API
    Services: {
      addService: async (providerId: string, service: any) => {
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        const providerServices = allServices[providerId] || [];
        const newService = { ...service, id: `svc-${Date.now()}` };
        allServices[providerId] = [...providerServices, newService];
        allServices[providerId] = [...providerServices, newService];
        saveToDB(DB_KEYS.SERVICES, allServices);
        realtime.publish("CLIENT_UPDATE", {}); // Notify clients
        return newService;
      },
      getServices: async (providerId: string) => {
        console.log("Fetching Services for:", providerId);
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        // Fallback to Mock Data
        const mockSvcs = (MOCK_SERVICES as any)[providerId];
        console.log("Mock Services Found:", mockSvcs);
        if (!allServices[providerId] && mockSvcs) {
          return mockSvcs;
        }
        return allServices[providerId] || [];
      },
      getAllServices: async () => {
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        // Fallback: merge with MOCK_SERVICES
        const mergedServices: any[] = [];

        // 1. Get all unique provider IDs (from keys of allServices + keys of MOCK_SERVICES)
        const allProviderIds = new Set([
          ...Object.keys(allServices),
          ...Object.keys(MOCK_SERVICES)
        ]);

        allProviderIds.forEach(pid => {
          const dbSvcs = allServices[pid] || [];
          const mockSvcs = (MOCK_SERVICES as any)[pid] || [];

          // Deduplicate by ID if needed, or just prefer DB over mock if ID matches?
          // Simple approach: Use DB list if exists and not empty, else use Mock. 
          // Better approach for "listing all": Combine them.

          // Let's rely on getServices logic essentially:
          let svcs = [];
          if (dbSvcs.length > 0) {
            svcs = dbSvcs;
          } else {
            svcs = mockSvcs;
          }

          svcs.forEach((s: any) => {
            mergedServices.push({ ...s, providerId: pid });
          });
        });

        return mergedServices;
      },
      deleteService: async (providerId: string, serviceId: string) => {
        const allServices = getFromDB(DB_KEYS.SERVICES, {});
        const providerServices = allServices[providerId] || [];
        allServices[providerId] = providerServices.filter((s: any) => s.id !== serviceId);
        saveToDB(DB_KEYS.SERVICES, allServices);
        realtime.publish("CLIENT_UPDATE", {}); // Notify clients
      }
    },

    // Packages API
    Packages: {
      addPackage: async (providerId: string, pkg: any) => {
        const allPackages = getFromDB(DB_KEYS.PACKAGES, {});
        const providerPackages = allPackages[providerId] || [];
        const newPackage = { ...pkg, id: `pkg-${Date.now()}` };
        allPackages[providerId] = [...providerPackages, newPackage];
        saveToDB(DB_KEYS.PACKAGES, allPackages);
        return newPackage;
      },
      getPackages: async (providerId: string) => {
        console.log("Fetching Packages for:", providerId);
        const allPackages = getFromDB(DB_KEYS.PACKAGES, {});
        // Fallback to Mock Data if no persisted data for this provider
        const mockPkgs = (MOCK_PACKAGES as any)[providerId];
        console.log("Mock Packages Found:", mockPkgs);
        if (!allPackages[providerId] && mockPkgs) {
          return mockPkgs;
        }
        return allPackages[providerId] || [];
      },
      deletePackage: async (providerId: string, packageId: string) => {
        const allPackages = getFromDB(DB_KEYS.PACKAGES, {});
        const providerPackages = allPackages[providerId] || [];
        allPackages[providerId] = providerPackages.filter((p: any) => p.id !== packageId);
        saveToDB(DB_KEYS.PACKAGES, allPackages);
      }
    },

    // 7. Direct Messaging API
    DirectMessages: {
      getConversations: async (): Promise<any[]> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const session = localStorage.getItem(DB_KEYS.SESSION);
        const user = session ? JSON.parse(session) : null;
        if (!user) return [];

        const allConvos = getFromDB(DB_KEYS.CONVERSATIONS, []);
        // Filter where user is a participant
        return allConvos.filter((c: any) => c.participants.some((p: any) => p.id === user.id || p.id === 'u-current'));
      },

      getMessages: async (conversationId: string): Promise<any[]> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        const allMsgs = getFromDB(DB_KEYS.DIRECT_MESSAGES, []);
        return allMsgs.filter((m: any) => m.conversationId === conversationId).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      },

      sendMessage: async (conversationId: string, text: string, type: "text" | "video_call_start" | "video_call_end" = "text") => {
        const session = localStorage.getItem(DB_KEYS.SESSION);
        const user = session ? JSON.parse(session) : { id: 'u-current' };

        const allMsgs = getFromDB(DB_KEYS.DIRECT_MESSAGES, []);
        const newMessage = {
          id: `dm - ${Date.now()} `,
          conversationId,
          senderId: user.id,
          text,
          timestamp: new Date().toISOString(),
          type
        };

        allMsgs.push(newMessage);
        saveToDB(DB_KEYS.DIRECT_MESSAGES, allMsgs);

        // Update Conversation Last Message
        const allConvos = getFromDB(DB_KEYS.CONVERSATIONS, []);
        const convoIdx = allConvos.findIndex((c: any) => c.id === conversationId);
        if (convoIdx !== -1) {
          allConvos[convoIdx].lastMessage = {
            text: type.includes('video') ? 'Video Call' : text,
            timestamp: newMessage.timestamp,
            senderId: user.id
          };
          saveToDB(DB_KEYS.CONVERSATIONS, allConvos);
        }

        realtime.publish("DM_UPDATE", newMessage);
        return newMessage;
      }
    }
  },
};
