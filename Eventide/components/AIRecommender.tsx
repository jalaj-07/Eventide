import React, { useState } from "react";
import { Sparkles, Send, Mic } from "lucide-react";
import { extractEventFilters } from "../services/geminiService";

interface AIRecommenderProps {
  onRecommend: (filters: {
    category?: string;
    maxPrice?: number;
    search?: string;
    description?: string;
  }) => void;
  className?: string;
}

const AIRecommender: React.FC<AIRecommenderProps> = ({
  onRecommend,
  className = "",
}) => {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);



  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Real AI Logic
  const analyzeInput = async (text: string) => {
    setIsAnalyzing(true);
    setAiResponse(null);

    // Call Real/Mock Gemini Service
    const result = await extractEventFilters(text);

    // Show Reply
    setAiResponse(result.reply);

    // Propagate Filters
    onRecommend({
        category: result.category,
        maxPrice: result.maxPrice,
        search: result.search,
        description: result.description || text
    });

    setIsAnalyzing(false);
    setInput("");
  };

  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true; // Enable interim results for live feedback

    recognition.onstart = () => {
        setIsAnalyzing(true);
        setIsListening(true);
    };
    recognition.onend = () => {
        setIsListening(false);
        // Don't turn off analyzing yet, as we might be processing the final result
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      if (event.results[0].isFinal) {
          analyzeInput(transcript);
          setIsListening(false);
      }
    };

    recognition.start();
  };

  const handleDetailedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    analyzeInput(input);
  };

  const moodChips = [
    { label: "Relaxed ☕", query: "chill coffee events", color: "bg-orange-100 text-orange-700 border-orange-200" },
    { label: "Party 🎉", query: "nightlife party music", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { label: "Romantic ❤️", query: "romantic dinner date", color: "bg-pink-100 text-pink-700 border-pink-200" },
    { label: "Adventure 🧗", query: "outdoor adventure sports", color: "bg-green-100 text-green-700 border-green-200" },
    { label: "Learning 🧠", query: "workshops tech learning", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { label: "Foodie 🍔", query: "food festivals tasting", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    { label: "Music 🎵", query: "live music concerts", color: "bg-violet-100 text-violet-700 border-violet-200" },
    { label: "Art 🎨", query: "art galleries exhibitions", color: "bg-red-100 text-red-700 border-red-200" },
    { label: "Social 🤝", query: "networking community meetup", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { label: "Family 👨‍👩‍👧", query: "kids family friendly events", color: "bg-lime-100 text-lime-700 border-lime-200" },
  ];

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 shadow-2xl ${className}`}
    >
      <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] p-8 sm:p-10 relative z-10 h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 flex items-center gap-3">
            <Sparkles className="text-indigo-600" fill="currentColor" size={32} /> 
            Eventide AI
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
            Not sure what to do? Tell me your mood, budget, or vibe.
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={handleDetailedSubmit} className="relative group mb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-100 transition duration-500 blur"></div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 shadow-sm">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "e.g., 'I want a romantic dinner under ₹2000'..."}
              className="w-full bg-transparent border-none outline-none text-slate-700 dark:text-white placeholder-slate-400 p-2 text-lg h-14"
            />
            
            <div className="flex items-center gap-3 pr-2">
              <button 
                type="button"
                onClick={startListening}
                className={`p-3 transition rounded-full active:scale-90 ${isListening ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                title="Voice Input"
              >
                {isListening ? (
                    <div className="flex items-center gap-1 h-6">
                        <span className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                        <span className="w-1 h-5 bg-red-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                        <span className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                    </div>
                ) : (
                    <Mic size={24} />
                )}
              </button>
              <button 
                type="submit"
                disabled={!input.trim() || isAnalyzing}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  input.trim() 
                    ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-md hover:shadow-lg scale-100" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-300 scale-90"
                }`}
              >
                {isAnalyzing ? (
                  <Sparkles size={24} className="animate-spin" />
                ) : (
                  <Send size={24} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* AI Reply Bubble */}
        {aiResponse && (
            <div className="mb-6 animate-fade-in-up bg-white/50 dark:bg-slate-800/50 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl flex gap-3 items-start backdrop-blur-sm">
                <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg shrink-0">
                    <Sparkles size={16} />
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed pt-1">
                    "{aiResponse}"
                </p>
                <button onClick={() => setAiResponse(null)} className="ml-auto text-slate-400 hover:text-slate-600 p-1">
                    <span className="sr-only">Dismiss</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
        )}

        {/* Quick Moods */}
        <div>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 block">
            Or choose a vibe
          </span>
          <div className="flex flex-wrap gap-3">
            {moodChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => analyzeInput(chip.query)}
                className={`px-5 py-3 rounded-xl text-sm font-bold border ${chip.color} bg-opacity-50 hover:bg-opacity-100 transition-all active:scale-95 shadow-sm hover:shadow-md`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
          <Sparkles size={160} />
        </div>
      </div>
    </div>
  );
};

export default AIRecommender;
