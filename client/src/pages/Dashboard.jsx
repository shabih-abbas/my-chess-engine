import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import GameHistory from '../components/GameHistory';
import King from '../assets/king-w.svg'

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games/my-games');
        const data = await res.json();
        if (res.ok) setGames(data);
      } catch (err) {
        console.error("Dashboard: Error fetching games");
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="min-h-screen bg-chess-pattern bg-fixed relative flex flex-col">
      <div className="fixed inset-0 bg-black/75 z-0 pointer-events-none" />

      <div className="relative z-10 w-full pb-20">
        <nav className="glass-panel mx-4 md:mx-6 mt-4 md:mt-6 px-6 md:px-10 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between border-white/5 gap-4 md:gap-0">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <img src={King} alt="Logo" className="w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="text-white font-black tracking-tighter text-xl md:text-2xl uppercase whitespace-nowrap">
              My Chess <span className="text-chess-gold">Engine</span>
            </span>
          </Link>

          <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-10 border-t border-white/5 md:border-none pt-4 md:pt-0">
            <div className="flex gap-4 md:gap-8">
              <Link to="/game-setup" className="text-white/60 hover:text-chess-gold font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all">
                New Game
              </Link>
              <Link to="/analyze" className="text-white/60 hover:text-chess-gold font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all">
                Analyze
              </Link>
            </div>
            
            <div className="hidden md:block h-8 w-px bg-white/5" />
            
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:block text-right">
                <p className="text-white text-xs font-bold leading-none">{user?.username}</p>
                <p className="text-chess-gold text-[10px] uppercase tracking-widest mt-1">Member</p>
              </div>
              <button 
                onClick={logout}
                className="glass-panel px-3 md:px-4 py-2 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 text-[9px] md:text-[10px] font-black uppercase transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 mt-12 md:mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">
                Grandmaster <span className="text-chess-gold">{user?.username?.split(' ')[0]}</span>
              </h2>
              <p className="text-white/40 mt-2 md:mt-3 text-base md:text-lg font-light">Your analytical dashboard is ready.</p>
            </div>
            
            <div className="glass-panel px-6 py-3 text-center self-start md:self-auto">
              <span className="block text-chess-gold font-bold text-xl leading-none">{games.length}</span>
              <span className="text-white/30 text-[10px] uppercase tracking-widest">Total Games</span>
            </div>
          </div>

          <GameHistory games={games} />
        </main>
      </div>
    </div>
  );
}