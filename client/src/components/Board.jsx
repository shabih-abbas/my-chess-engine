import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Board({ socket, userColor, selectedOpening, setTurn, onGameOver }) {
  const gameRef = useRef(new Chess());
  const game = gameRef.current;

  const [position, setPosition] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [isEngineTurn, setIsEngineTurn] = useState(userColor === "black");

  const checkGameOver = useCallback(() => {
    if (game.isGameOver()) {
      let result = "Draw";
      if (game.isCheckmate())
        result = game.turn() === "w" ? "Black Wins" : "White Wins";
      onGameOver(result);
      return true;
    }
    return false;
  }, [onGameOver]);

  useEffect(() => {
    socket.emit("guest:start_game", { 
      openingName: selectedOpening, 
      userColor: userColor 
    });

    socket.on("guest:engine_move", ({ move }) => {
      try {
        game.move(move);
        setPosition(game.fen());
        setIsEngineTurn(false);
        setTurn("user");
        checkGameOver();
      } catch (e) {
        console.error("Invalid move received from engine:", move);
      }
    });

    return () => {
      socket.off("guest:engine_move");
    };
  }, [socket, selectedOpening, userColor, setTurn, checkGameOver]);

  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    for (const move of moves) {
      const isCapture =
        game.get(move.to) &&
        game.get(move.to).color !== game.get(square)?.color;
      newSquares[move.to] = {
        background: isCapture
          ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
          : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    }
    newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
    setOptionSquares(newSquares);
    return true;
  }

  function afterUserMove(move) {
    setPosition(game.fen());
    setMoveFrom("");
    setOptionSquares({});
    setTurn("engine");

    if (checkGameOver()) return;

    setIsEngineTurn(true);
    const moveString = move.from + move.to + (move.promotion || "");
    socket.emit("guest:move", moveString);
  }

  function onSquareClick({ square, piece }) {
    if (game.isGameOver() || isEngineTurn) return;
    if (game.turn() !== userColor[0]) return;

    if (!moveFrom) {
      const currentPiece = game.get(square);
      if (!currentPiece || currentPiece.color !== userColor[0]) return;
      const hasMoves = getMoveOptions(square);
      if (hasMoves) setMoveFrom(square);
      return;
    }

    const moves = game.moves({ square: moveFrom, verbose: true });
    const found = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!found) {
      const currentPiece = game.get(square);
      if (currentPiece && currentPiece.color === userColor[0]) {
        const hasMoves = getMoveOptions(square);
        setMoveFrom(hasMoves ? square : "");
      } else {
        setMoveFrom("");
        setOptionSquares({});
      }
      return;
    }

    try {
      const move = game.move({ from: moveFrom, to: square, promotion: "q" });
      afterUserMove(move);
    } catch {
      setMoveFrom("");
      setOptionSquares({});
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare, piece }) {
    if (game.isGameOver() || isEngineTurn) return false;
    if (game.turn() !== userColor[0]) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;
      afterUserMove(move);
      return true;
    } catch {
      return false;
    }
  }
  function canDragPiece({piece}){
    if(game.isGameOver() || isEngineTurn) return false;
    return game.turn() === userColor[0] && piece.pieceType[0] === userColor[0];
  }

  const chessBoardOptions = {
    position,
    canDragPiece,
    onSquareClick,
    onPieceDrop,
    boardOrientation: userColor,
    squareStyles: optionSquares,
    animationDurationInMs: 300,
    darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
    lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
    dropSquareStyle: {boxShadow: "inset 0 0 1px 4px rgba(255,255,255,0.4)"},
  }

  return (
    <div className="w-[90vw] sm:w-[80vw] lg:w-[70vh] aspect-square shadow-2xl relative">
      <Chessboard
        options={chessBoardOptions}
      />
    </div>
  );
}