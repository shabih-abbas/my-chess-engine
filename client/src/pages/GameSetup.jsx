import { useState } from "react";
import { Link, useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import Wpawn from "../assets/pawn-w.svg";
import Bpawn from "../assets/pawn-b.svg";

export default function GameSetup() {
  const [color, setColor] = useState('white');
  const [opening, setOpening] = useState('Sicilian Defense');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function createGame(playerColor, opening){
    try{
      setLoading(true);
      const res = await fetch("/api/games/new", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({playerColor, opening}),
        credentials: 'include'
      });
      const data = await res.json();
      if(res.ok){
        navigate("/play/"+data.gameId);
      }
      else{
        toast.error(data.message, {
        style: { borderRadius: '8px', background: '#333', color: '#fff', border: '1px solid #ef4444' },
        });
      }
    }catch(err){
      toast.error(err.message);
    }
    finally{
      setLoading(false);
    }
  }

  const openings = [
    "Sicilian Defense",
    "Queen's Gambit",
    "Ruy Lopez",
    "London System",
    "Italian Game"
  ];

  return (
    <main className="min-h-screen bg-chess-board flex flex-col items-center justify-center p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="glass-panel w-full max-w-md p-8 text-center shadow-2xl border-white/20">
        <h2 className="text-3xl font-extrabold text-chess-gold mb-8 uppercase tracking-widest">
          Game Setup
        </h2>

        <div className="flex gap-6 justify-center mb-8">
          <button 
            onClick={() => setColor('white')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer
              ${color === 'white' 
                ? 'bg-board-light border-chess-gold scale-105 shadow-lg' 
                : 'bg-white/5 border-transparent opacity-60 hover:opacity-100 hover:bg-white/10'}`}
          >
            <img src={Wpawn} alt="White" className="w-16 h-16 mb-2 drop-shadow-md" />
            <span className={`font-bold uppercase tracking-wider ${color === 'white' ? 'text-chess-board' : 'text-white'}`}>White</span>
          </button>

          <button 
            onClick={() => setColor('black')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer
              ${color === 'black' 
                ? 'bg-board-dark border-chess-gold scale-105 shadow-lg' 
                : 'bg-white/5 border-transparent opacity-60 hover:opacity-100 hover:bg-white/10'}`}
          >
            <img src={Bpawn} alt="Black" className="w-16 h-16 mb-2 drop-shadow-md" />
            <span className="font-bold uppercase tracking-wider text-white">Black</span>
          </button>
        </div>

        <div className="mb-10 text-left">
          <label className="block text-chess-gold uppercase text-xs font-bold tracking-widest mb-2 px-1">
            Choose Opening
          </label>
          <select 
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3 outline-none focus:border-chess-gold transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='gold' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
          >
            {openings.map((opt) => (
              <option key={opt} value={opt} className="bg-chess-board text-white">
                {opt}
              </option>
            ))}
          </select>
        </div>

        <p className="mb-8 text-chess-gold/80 font-medium italic text-sm">
          Playing as <span className="font-bold capitalize">{color}</span> with the <span className="font-bold">{opening}</span>
        </p>

        {user ?
        <button disabled={loading} onClick={() => createGame(color, opening)} className="disabled:opacity-50 disabled:cursor-not-allowed btn-gold inline-block w-full py-4 text-xl uppercase tracking-widest no-underline rounded-lg font-bold">
          {loading ? "Initializing..." :"Create Game"}
        </button>        
        :<Link 
          to={`/play?color=${color}&opening=${encodeURIComponent(opening)}`} 
          className="btn-gold inline-block w-full py-4 text-xl uppercase tracking-widest no-underline rounded-lg font-bold"
        >
          Start Game
        </Link>}
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