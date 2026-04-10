import { useState } from "react";
import { useParams, Link } from "react-router";
import Board from "../components/Board";
import UserAvatar from "../components/userAvatar";
import EngineAvatar from "../components/engineAvatar";
import ResultModal from "../components/ResultModal";

export default function Play() {
  const params = useParams();
  const userColor = ['white', 'black'].includes(params.userColor) ? params.userColor : 'white';
  const [turn, setTurn] = useState(userColor === 'white' ? 'user' : 'engine');
  const [gameResult, setGameResult] = useState(null);

  return (
    <main className="h-screen w-full bg-chess-board flex flex-row p-4 lg:p-8 overflow-hidden relative">
      
      <div className="flex flex-col justify-between w-64 shrink-0 h-full border-r border-white/5 pr-6">
        
        <div className="flex gap-y-8 flex-col grow">
          <div className="flex flex-col justify-between grow">
            <div className={`transition-opacity duration-500 ${turn === 'engine' ? 'opacity-100' : 'opacity-40'}`}>
                <EngineAvatar isEngineMove={turn === 'engine'} />
            </div>

            <div className={`transition-opacity duration-500 ${turn === 'user' ? 'opacity-100' : 'opacity-40'}`}>
                <UserAvatar isUserMove={turn === 'user'} />
            </div>
          </div>
            <div className="flex flex-col gap-3 mt-6">
              <Link 
                to='/' 
                className="w-full text-center py-2.5 rounded font-bold border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                Abort
              </Link>
              <Link 
                to='/' 
                className="w-full text-center py-2.5 rounded font-bold bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                Resign
              </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center h-full">
        <div className="relative p-2 bg-chess-wood-light rounded-sm shadow-2xl border-[4px] border-chess-gold-dark aspect-square">
           <Board userColor={userColor} setTurn={setTurn} onGameOver={setGameResult} />
        </div>
      </div>

      {gameResult && <ResultModal result={gameResult} />}
    </main>
  );
}