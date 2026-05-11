import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { BrainCircuit } from "lucide-react";

export default function AnalysisSetup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [depth, setDepth] = useState(5);
  const [loading, setLoading] = useState(false);

  const gameId = searchParams.get("gameId");

  async function handleInitializeAnalysis() {
    try {
      setLoading(true);
      const res = await fetch("/api/analysis/get", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gameId, depth }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/analysis/${data.sessionId}`);
      } else {
        toast.error(data.message, {
          style: {
            borderRadius: "8px",
            background: "#333",
            color: "#fff",
            border: "1px solid #ef4444",
          },
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-chess-board flex flex-col items-center justify-center p-6">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="glass-panel w-full max-w-md p-8 text-center shadow-2xl border-white/20">
        <h2 className="text-3xl font-extrabold text-chess-gold mb-4 uppercase tracking-widest">
          Engine Analysis
        </h2>
        
        <p className="text-white/60 text-sm mb-8 italic">
          {gameId ? "Deep dive into your performance" : "Analyze your most recent game"}
        </p>

        <div className="mb-10">
          <label className="block text-chess-gold uppercase text-xs font-bold tracking-widest mb-6 px-1 text-left">
            Select Engine Depth
          </label>
          
          <div className="grid grid-cols-4 gap-3">
            {[3, 4, 5, 6].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`py-4 rounded-xl font-bold transition-all duration-300 border-2 
                  ${depth === d 
                    ? "bg-chess-gold border-chess-gold text-chess-board scale-105 shadow-lg" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/30"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/80 text-xs leading-relaxed">
              Higher depth provides more accurate evaluations but takes longer to compute.
              <br />
              <span className="text-chess-gold/80 mt-2 block">
                Selected: <span className="font-bold">Depth {depth}</span>
              </span>
            </p>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleInitializeAnalysis}
          className="disabled:opacity-50 disabled:cursor-not-allowed btn-gold w-full py-4 text-xl uppercase tracking-widest no-underline rounded-lg font-bold flex items-center justify-center gap-3 transition-transform active:scale-95"
        >
          {loading ? (
            "Preparing..."
          ) : (
            <>
              <BrainCircuit className="text-center w-6 h-6" />
              Analyze Game
            </>
          )}
        </button>

        <Link 
          to='/dashboard' 
          className="mt-6 block text-white/40 hover:text-white/80 transition-colors text-sm uppercase tracking-widest font-bold"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}