import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real app, ensure import.meta.env.VITE_API_KEY is defined in your build environment.
// For this demo, we assume the environment variable is injected.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const generateEventAdvice = async (userPrompt: string): Promise<string> => {
  // Graceful Fallback for Demo without API Key
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn("VITE_GEMINI_API_KEY is missing. Returning mock AI response.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    const lowerPrompt = userPrompt.toLowerCase();
    if (lowerPrompt.includes("theme")) return "For a summer wedding, consider a 'Tropical Elegance' theme with vibrant orchids, palm leaves, and gold accents. It feels luxurious yet relaxed!";
    if (lowerPrompt.includes("venue")) return "Based on your location, I recommend checking out 'The Grand Ballroom' for luxury or 'Sunset Gardens' for an outdoor vibe. Both have availability next month.";
    if (lowerPrompt.includes("budget")) return "To save on budget, consider booking a venue on a Friday or Sunday, which can be 20-30% cheaper than Saturdays. Also, buffets are often more cost-effective than plated dinners.";
    return "That sounds like a great idea! I can help you organize the details. Would you like to see some vendor recommendations for that?";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: "You are Eventide AI, an expert event planner. Answer user questions about events, venues, and planning concisely.",
      },
    });
    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the planning intelligence network right now.";
  }
};

export interface AIRecommendation {
  category?: string;
  maxPrice?: number;
  search?: string;
  description?: string;
  reply: string;
}

export const extractEventFilters = async (userPrompt: string): Promise<AIRecommendation> => {
  // FALLBACK IF NO KEY
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    await new Promise(r => setTimeout(r, 1500));
    const lower = userPrompt.toLowerCase();

    let reply = "I've applied some filters for you based on that.";
    if (lower.includes("romantic")) reply = "Ooh, planning a romantic date? Here are some lovely spots.";
    else if (lower.includes("party")) reply = "Time to celebrate! Checking out the hottest parties.";
    else if (lower.includes("cheap")) reply = "I found some great budget-friendly options.";

    // Basic Regex logic (moved from component)
    const filters: any = { description: userPrompt, reply };
    if (lower.includes("music") || lower.includes("concert")) filters.category = "Music";
    else if (lower.includes("food") || lower.includes("dinner")) filters.category = "Food";
    else if (lower.includes("tech")) filters.category = "Tech";
    else if (lower.includes("art")) filters.category = "Art";

    const priceMatch = lower.match(/under\s?(\d+)/) || lower.match(/(\d+)/);
    if (priceMatch && priceMatch[1]) filters.maxPrice = parseInt(priceMatch[1], 10);

    return filters;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `User Request: "${userPrompt}"
            
            Extract the following fields in JSON format:
            - category: (String, optional) One of: Music, Food, Tech, Art, Social, Sports, Business
            - maxPrice: (Number, optional) Budget limit if mentioned
            - search: (String, optional) Key search terms (mood/vibe)
            - reply: (String, required) A short, friendly, expert conversational response answering the user (e.g. "I found some great jazz concerts under ₹500 for you!").
            `,
      config: {
        // validation or schema could go here if using newer SDK features, but text parsing is robust enough for now
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data as AIRecommendation;

  } catch (e) {
    console.error("Gemini Filter Extract Error", e);
    return { reply: "Sorry, I assume you want to search for that.", description: userPrompt };
  }
}