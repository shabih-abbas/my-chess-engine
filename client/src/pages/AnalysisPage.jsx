import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { io } from "socket.io-client";
import { ChevronLeft, ChevronRight, MessageSquare, Send } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AnalysisPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  const [gameMoves, setGameMoves] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [depth, setDepth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is starting position
  const [currentFen, setCurrentFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [showBestMove, setShowBestMove] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    socketRef.current = io({ withCredentials: true });

    socketRef.current.emit("analysis:init", { sessionId });

    socketRef.current.on("analysis:sync_state", ({ moves, annotations, status, depth }) => {
      setGameMoves(moves);
      setAnnotations(annotations);
      setDepth(depth);
      if(status === "completed") setProgress(100);
      if (moves.length > 0) {
        setCurrentIndex(0);
        setCurrentFen(moves[0].fenAfter);
      }
    });

    socketRef.current.on("analysis:complete", () => {
        setProgress(100);
    });

    socketRef.current.on("analysis:move_ready", ({ annotation, progress }) => {
      setAnnotations(prev => [...prev, annotation]);
      setProgress(progress);
    });

    socketRef.current.on("analysis:comment_saved", ({ annotationId, comment }) => {
      setAnnotations(prev => 
        prev.map(a => a._id === annotationId ? { ...a, comment } : a)
      );
      toast.success("Comment saved");
    });

    socketRef.current.on("analysis:error", (msg) => toast.error(msg));

    return () => socketRef.current.disconnect();
  }, [sessionId]);

  const jumpToMove = (index) => {
    if (index === -1) {
      setCurrentFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    } else {
      setCurrentFen(gameMoves[index].fenAfter);
    }
    setCurrentIndex(index);
  };

  const saveComment = () => {
    const currentAnnotation = annotations.find(a => a.moveNumber === currentIndex + 1);
    if (!currentAnnotation) return toast.error("Wait for engine analysis of this move.");
    
    socketRef.current.emit("analysis:update_comment", {
      annotationId: currentAnnotation._id,
      comment: commentInput
    });
    setCommentInput("");
  };

  const getEvalPercentage = () => {
    const currentAnnot = annotations.find(a => a.moveNumber === currentIndex + 1);
    if (!currentAnnot) return 50;
    
    let score = currentAnnot.eval;

    if (score >= 28000) return 95;
    if (score <= -28000) return 5;

    const percentage = 50 + (score / 20); 
    return Math.max(5, Math.min(95, percentage));
};
  const formatEval = (score) => {
    if (score === undefined || score === null) return "0.0";
    
    if (Math.abs(score) >= 28000) {
        const movesToMate = 29000 - Math.abs(score);
        return score > 0 ? `+M${movesToMate}` : `-M${movesToMate}`;
    }
    
    const val = (score / 100).toFixed(1);
    return score > 0 ? `+${val}` : val;
};
    const getArrowFromUCI = (uciStr) => {
        if (!uciStr || uciStr.length < 4) return null;
        const start = uciStr.slice(0, 2);
        const end = uciStr.slice(2, 4);
        return ({
            startSquare: start,
            endSquare: end,
            color: 'green'
        });
    };
    const currentAnnot = annotations.find(a => a.moveNumber === currentIndex + 1);
    const bestMoveUCI = currentAnnot?.bestLine?.[0];
    const bestArrow = showBestMove && bestMoveUCI ? [getArrowFromUCI(bestMoveUCI)] : [];

    const toggleOrientation = () => {
        setBoardOrientation(prev => prev === "white" ? "black" : "white");
    };

  return (
    <main 
        className="min-h-screen lg:h-screen bg-chess-board flex flex-col lg:flex-row overflow-x-hidden"
        style={{ '--eval-percent': `${getEvalPercentage()}%` }}
    >
      <Toaster position="bottom-center" />

      <div className="h-4 lg:h-full w-full lg:w-8 bg-zinc-800 flex flex-row lg:flex-col justify-start lg:justify-end relative border-b lg:border-r border-white/10">
        <div className="bg-white transition-all duration-500 ease-out h-full lg:w-full w-(--eval-percent) lg:h-(--eval-percent)"/>
        <span className="hidden lg:block absolute top-4 left-0 w-full text-center text-[10px] font-bold text-white z-10">
          {formatEval(annotations.find(a => a.moveNumber === currentIndex + 1)?.eval)}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center p-4 lg:p-8">
        <div className=" lg:max-h-[60vh] aspect-square relative">
          <Chessboard 
            options={{
                position: currentFen,
                boardOrientation: boardOrientation, 
                allowDragging: false,
                boardStyle: { borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' },
                animationDurationInMs: 300,
                arrows: bestArrow,
                darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
                lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
            }}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <button onClick={() => jumpToMove(currentIndex - 1)} disabled={currentIndex === -1} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-colors">
            <ChevronLeft className="text-white" />
          </button>
          <button 
            onClick={toggleOrientation}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-colors border border-white/10"
          >
                Flip Board
          </button>
          <button onClick={() => jumpToMove(currentIndex + 1)} disabled={currentIndex === gameMoves.length - 1} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 transition-colors">
            <ChevronRight className="text-white" />
          </button>
        </div>

        <div className="w-full max-h-[200px] max-w-4xl mt-8 bg-black/30 p-4 rounded-xl overflow-y-auto flex flex-wrap gap-2 border border-white/5 custom-scrollbar">
          <button 
            onClick={() => jumpToMove(-1)}
            className={`px-2 py-1.5 rounded font-bold text-[12px] shrink-0 ${currentIndex === -1 ? 'bg-chess-gold text-black' : 'text-white/60 hover:text-white'}`}
          >
            Start
          </button>
          {gameMoves.map((m, i) => (
            <button
              key={i}
              onClick={() => jumpToMove(i)}
              className={`px-2 py-1.5 rounded font-mono text-[12px] shrink-0 transition-colors
                ${currentIndex === i ? 'bg-chess-gold text-black' : 'bg-white/5 text-white/80 hover:bg-white/10'}`}
            >
              {i % 2 === 0 ? `${Math.floor(i/2) + 1}. ` : ""}{m.notation}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-80 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col shrink-0">
        <div className="p-4 lg:p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-chess-gold font-bold uppercase tracking-widest flex items-center gap-2 text-sm">
              Analysis
              {progress < 100 && <span className="text-[10px] bg-chess-gold/20 px-2 py-0.5 rounded animate-pulse">{progress}%</span>}
          </h3>
          <div className="text-xs text-white/40 font-mono uppercase">
              Depth {depth}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {currentIndex === -1 ? (
            <p className="text-white/40 italic text-sm">Starting Position</p>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full 
                    ${currentAnnot?.annotationType === 'blunder' ? 'bg-red-500/20 text-red-500' : currentAnnot?.annotationType === 'mistake' || currentAnnot?.annotationType === 'inaccuracy' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                    {currentAnnot?.annotationType || "Evaluating..."}
                  </span>
                  <p className="text-white font-bold text-lg">
                      {gameMoves[currentIndex]?.notation} 
                      <span className="text-chess-gold text-sm ml-2 font-mono">
                          ({formatEval(currentAnnot?.eval)})
                      </span>
                  </p>
                </div>
                <button 
                  onClick={() => setShowBestMove(!showBestMove)}
                  className={`text-[10px] uppercase font-black px-3 py-2 rounded transition-colors ${showBestMove ? 'bg-chess-gold text-black' : 'bg-white/10 text-white/60'}`}
                >
                  {showBestMove ? "Hide Arrow" : "Show Arrow"}
                </button>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <label className="text-[10px] text-white/40 uppercase font-bold block mb-2 tracking-tighter">Best Line</label>
                <p className="text-chess-gold font-mono text-sm leading-relaxed">
                    {currentAnnot?.bestLine.join(" ") || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-bold block">Notes</label>
                <div className="bg-black/20 p-4 rounded text-sm text-white/70 italic min-h-[80px]">
                   {currentAnnot?.comment || "No notes for this move."}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10">
          <div className="relative">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add your note..."
              className="w-full bg-white/5 rounded-lg p-3 pr-12 text-sm text-white outline-none border border-white/10 focus:border-chess-gold resize-none h-20"
            />
            <button 
              onClick={saveComment}
              className="absolute right-2 bottom-2 p-2 bg-chess-gold rounded-md text-black hover:scale-105 transition-transform"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}