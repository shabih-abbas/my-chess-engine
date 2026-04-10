import { useState } from "react";
import { Link } from "react-router";
import Wpawn from "../assets/pawn-w.svg";
import Bpawn from "../assets/pawn-b.svg";

export default function GameSetup() {
  const [color, setColor] = useState('white');

  return (
    <main className="min-h-screen bg-chess-board flex flex-col items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-8 text-center shadow-2xl border-white/20">
        <h2 className="text-3xl font-extrabold text-chess-gold mb-8 uppercase tracking-widest">
          Choose Your Side
        </h2>

        <div className="flex gap-6 justify-center mb-10">
          <button 
            onClick={() => setColor('white')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer
              ${color === 'white' 
                ? 'bg-board-light border-chess-gold scale-105 shadow-lg' 
                : 'bg-white/5 border-transparent opacity-60 hover:opacity-100 hover:bg-white/10'}`}
          >
            <img src={Wpawn} alt="White" className="w-20 h-20 mb-2 drop-shadow-md" />
            <span className="font-bold uppercase tracking-wider text-chess-board">White</span>
          </button>

          <button 
            onClick={() => setColor('black')}
            className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 border-2 cursor-pointer
              ${color === 'black' 
                ? 'bg-board-dark border-chess-gold scale-105 shadow-lg' 
                : 'bg-white/5 border-transparent opacity-60 hover:opacity-100 hover:bg-white/10'}`}
          >
            <img src={Bpawn} alt="Black" className="w-20 h-20 mb-2 drop-shadow-md" />
            <span className="font-bold uppercase tracking-wider">Black</span>
          </button>
        </div>

        <p className="mb-8 text-chess-gold/80 font-medium italic">
          You are playing as <span className="font-bold capitalize underline decoration-chess-gold underline-offset-4">{color}</span>
        </p>

        <Link 
          to={'/play/' + color} 
          className="btn-gold inline-block w-full py-4 text-xl uppercase tracking-widest no-underline"
        >
          Start Game
        </Link>
      </div>
    </main>
  );
}