import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, useRef } from "react";

export default function Board({ userColor, setTurn, onGameOver }) {
  const gameRef = useRef(new Chess());
  const game = gameRef.current;

  const [position, setPosition] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [isEngineTurn, setIsEngineTurn] = useState(userColor === "black");

  // Engine move effect — triggers whenever isEngineTurn becomes true
  useEffect(() => {
    if (!isEngineTurn) return;

    if (game.isGameOver()) return;

    setTurn("engine");
    const timer = setTimeout(() => {
      const moves = game.moves({ verbose: true });
      const move = moves[Math.floor(Math.random() * moves.length)];
      game.move(move);
      setPosition(game.fen());
      setIsEngineTurn(false);
      setTurn("user");

      if (game.isGameOver()) {
        let result = "Draw";
        if (game.isCheckmate())
          result = game.turn() === "w" ? "Black Wins" : "White Wins";
        onGameOver(result);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [isEngineTurn]);

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

  function afterUserMove() {
    setPosition(game.fen());
    setMoveFrom("");
    setOptionSquares({});

    if (game.isGameOver()) {
      let result = "Draw";
      if (game.isCheckmate())
        result = game.turn() === "w" ? "Black Wins" : "White Wins";
      onGameOver(result);
      return;
    }

    setIsEngineTurn(true);
  }

  function handleSquareClick({ square }) {
    if (game.isGameOver() || isEngineTurn) return;
    const isUserTurn = game.turn() === userColor[0];

    if (!moveFrom) {
      if (!isUserTurn) return;
      const piece = game.get(square);
      if (!piece || piece.color !== userColor[0]) return;
      const hasMoves = getMoveOptions(square);
      if (hasMoves) setMoveFrom(square);
      return;
    }

    const moves = game.moves({ square: moveFrom, verbose: true });
    const found = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!found) {
      const piece = game.get(square);
      if (piece && piece.color === userColor[0] && isUserTurn) {
        const hasMoves = getMoveOptions(square);
        setMoveFrom(hasMoves ? square : "");
      } else {
        setMoveFrom("");
        setOptionSquares({});
      }
      return;
    }

    try {
      game.move({ from: moveFrom, to: square, promotion: "q" });
    } catch {
      const hasMoves = getMoveOptions(square);
      setMoveFrom(hasMoves ? square : "");
      return;
    }

    afterUserMove();
  }

  function handlePieceDrop(sourceSquare, targetSquare, piece) {
    if (game.isGameOver() || isEngineTurn) return false;
    if (game.turn() !== userColor[0]) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      if (!move) return false;
    } catch {
      return false;
    }

    afterUserMove();
    return true;
  }

  function canDragPiece(piece, sourceSquare) {
    if (game.isGameOver() || isEngineTurn) return false;
    return piece[0] === userColor[0];
  }

  return (
    <div className="w-[90vw] max-w-[600px] aspect-square">
      <Chessboard
        options={{
          position,
          boardOrientation: userColor,
          squareStyles: optionSquares,
          onSquareClick: handleSquareClick,
          onPieceDrop: handlePieceDrop,
          canDragPiece,
          allowDragging: true,
          allowDrawingArrows: true,
          clearArrowsOnClick: true,
          showAnimations: true,
          animationDurationInMs: 200,
          darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
          lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
          dropSquareStyle: {
            boxShadow: "inset 0 0 1px 4px rgba(255,255,255,0.4)",
          },
        }}
      />
    </div>
  );
}