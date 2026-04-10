import { Link } from "react-router";
export default function ResultModal({result}){
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-panel p-10 max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border-chess-gold/30">
            <h2 className="text-chess-gold font-black text-4xl mb-2 uppercase italic tracking-tighter">
              Game Over
            </h2>
            <p className="text-white text-xl font-bold mb-8 tracking-widest uppercase">
              {result}
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-gold w-full py-3 block text-center no-underline cursor-pointer"
              >
                Rematch
              </button>
              <Link to="/" className="block text-white/70 hover:text-white font-bold uppercase tracking-widest text-xs transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
}