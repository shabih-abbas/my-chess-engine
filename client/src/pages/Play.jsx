import { useState, useEffect } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast"; 
import Board from "../components/Board";
import UserAvatar from "../components/userAvatar";
import EngineAvatar from "../components/engineAvatar";
import ResultModal from "../components/ResultModal";
import Loading from "../components/Loading";

export default function Play() {
  const [searchParams] = useSearchParams();
  const { id: gameId } = useParams();
  const navigate = useNavigate();
  
  const [socket, setSocket] = useState(null);
  const [gameData, setGameData] = useState({
    userColor: 'white',
    opening: 'Sicilian Defense',
    isLoaded: false
  });
  
  const [turn, setTurn] = useState('white');
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    if (gameId) {
      const fetchGame = async () => {
        try {
          const res = await fetch(`/api/games/${gameId}`, { credentials: 'include' });
          const data = await res.json();
          if (res.ok) {
            setGameData({
              userColor: data.playerColor,
              opening: data.opening,
              isLoaded: true
            });
          } else {
            toast.error("Could not load game.");
            navigate("/game-setup");
          }
        } catch (err) {
          toast.error("Connection error.");
        }
      };
      fetchGame();
    } else {
      setGameData({
        userColor: ['white', 'black'].includes(searchParams.get('color')) ? searchParams.get('color') : 'white',
        opening: searchParams.get("opening") || "Sicilian Defense",
        isLoaded: true
      });
    }
  }, [gameId, searchParams, navigate]);

  useEffect(() => {
    const newSocket = io({
        withCredentials: true 
    });
    setSocket(newSocket);

    newSocket.on("guest:error", (msg) => toast.error(msg));
    newSocket.on("game:error", (msg) => toast.error(msg));
    newSocket.on("connect_error", () => toast.error("Lost connection to server."));
    newSocket.on("game:aborted_success", () => setGameResult("Aborted"));

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && gameId && gameData.isLoaded) {
        socket.emit("game:join", { gameId });
    }
  }, [socket, gameId, gameData.isLoaded]);

  async function abortGame(gameId) {
  if (!gameId) {
    setGameResult("Aborted");
    return;
  }

  socket.emit("game:abort", { gameId });
}

async function resignGame(gameId, winner) {
  if (!gameId) {
    setGameResult(`${winner.charAt(0).toUpperCase() + winner.slice(1)} Wins by Resignation`);
    return;
  }

  socket.emit("game:resign", { gameId, winner });
}

  if (!gameData.isLoaded) return <Loading />;

  return (
    <main className="h-screen w-full bg-chess-board flex flex-col lg:flex-row p-4 lg:p-8 overflow-hidden relative">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-row lg:flex-col justify-between w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/5 pb-4 lg:pb-0 lg:pr-6 mb-4 lg:mb-0">
        <div className="flex flex-row lg:flex-col gap-x-4 lg:gap-y-8 grow items-center lg:items-stretch">
          <div className={`flex-1 transition-opacity duration-500 ${turn === 'engine' ? 'opacity-100' : 'opacity-40'}`}>
            <EngineAvatar isEngineMove={turn === 'engine'} />
            {turn === 'engine' && !gameResult && (
              <p className="hidden lg:block text-chess-gold text-[10px] mt-2 animate-pulse uppercase tracking-widest text-center">
                Engine is thinking...
              </p>
            )}
          </div>

          <div className={`flex-1 transition-opacity duration-500 ${turn === 'user' ? 'opacity-100' : 'opacity-40'}`}>
            <UserAvatar isUserMove={turn === 'user'} />
          </div>
        </div>

        <div className="hidden lg:flex flex-col gap-3 mt-6">
          <button 
            onClick={() => abortGame(gameId)} 
            className="w-full text-center py-2.5 rounded font-bold border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            Abort
          </button>
          <button 
            onClick={() => resignGame(gameId, gameData.userColor === 'white'? 'black' : 'white')} 
            className="w-full text-center py-2.5 rounded font-bold bg-red-950/20 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-xs uppercase tracking-widest"
          >
            Resign
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <div className="relative p-1 lg:p-2 bg-chess-wood-light rounded-sm shadow-2xl border-[2px] lg:border-[3px] border-chess-gold-dark max-w-full max-h-full">
          {socket ? (
            <Board 
              gameId={gameId} 
              socket={socket}
              userColor={gameData.userColor} 
              selectedOpening={gameData.opening}
              setTurn={setTurn} 
              onGameOver={setGameResult} 
            />
          ) : (
            <div className="w-[80vw] lg:w-[600px] aspect-square flex items-center justify-center text-chess-gold animate-pulse uppercase tracking-widest font-bold text-xs lg:text-base">
              Establishing Connection...
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden flex flex-row gap-3 mt-4 w-full">
        <button onClick={() => setGameResult("Aborted")} className="flex-1 text-center py-3 rounded font-bold border border-white/10 text-white/60 text-[10px] uppercase tracking-widest">Abort</button>
        <button onClick={() => setGameResult("You Resigned")} className="flex-1 text-center py-3 rounded font-bold bg-red-950/20 text-red-500 border border-red-500/20 text-[10px] uppercase tracking-widest">Resign</button>
      </div>

      {gameResult && <ResultModal result={gameResult} />}
    </main>
  );
}