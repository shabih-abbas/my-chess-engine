import { Chess } from "chess.js";
import { spawn } from "child_process";
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import Game from "../models/Game.js";
import User from "../models/User.js";
import { getBookMove } from "../utils/openingBook.js";
import { getAuthenticatedUser } from "../middleware/socketAuth.js";
import { getEnginePath, getEnginePwd } from "../utils/enginePath.js";

export default function registeredHandler(io, socket) {
  
  socket.on("game:join", async ({ gameId }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return socket.emit("game:error", "Session expired. Please login again.");

      const game = await Game.findOne({ _id: gameId, userId: user._id });
      if (!game) return socket.emit("game:error", "Unauthorized access.");

      socket.join(`game-${gameId}`);

      socket.emit("game:sync", {
        playerColor: game.playerColor,
        currentFen: game.currentFen,
        moves: game.moves,
        status: game.status,
        openingName: game.opening,
        result: game.result,
      });

      const chess = new Chess(game.currentFen);
      const isEngineTurn = chess.turn() !== game.playerColor[0];

      if (isEngineTurn && game.status === "in-progress") {
        handleEngineMove(gameId, game, socket, io);
      }
    } catch (err) {
      socket.emit("game:error", "Failed to sync game.");
    }
  });

  socket.on("game:move", async ({ gameId, moveStr }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return socket.emit("game:error", "Not authorized.");

      const game = await Game.findOne({ _id: gameId, userId: user._id });
      if (!game || game.status !== "in-progress") return;

      const chess = new Chess(game.currentFen);
      if (chess.turn() !== game.playerColor[0]) return;

      const move = chess.move(moveStr);
      if (!move) return socket.emit("game:error", "Illegal move attempted.");

      game.moves.push({
        moveNumber: game.moves.length + 1,
        from: move.from,
        to: move.to,
        piece: move.piece,
        promotion: move.promotion || "",
        notation: move.san,
        fenAfter: chess.fen()
      });
      game.currentFen = chess.fen();
      
      if (chess.isGameOver()) {
        game.status = "completed";
        game.result = getResult(chess);
      }

      await game.save();

      io.to(`game-${gameId}`).emit("game:move_success", { fen: game.currentFen });

      if (game.status === "in-progress") {
        handleEngineMove(gameId, game, socket, io);
      } else {
        io.to(`game-${gameId}`).emit("game:over", { result: game.result });
      }
    } catch (err) {
      console.error(err);
      socket.emit("game:error", "Server failed to process move.");
    }
  });

  socket.on("game:resign", async ({ gameId, winner }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return socket.emit("game:error", "Unauthorized");

      const game = await Game.findOneAndUpdate(
        { _id: gameId, userId: user._id, status: "in-progress" },
        { status: "completed", result: winner },
        { new: true }
      );

      if (!game) return socket.emit("game:error", "Game not found or already finished.");

      io.to(`game-${gameId}`).emit("game:over", { 
        result: `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins by resignation` 
      });
    } catch (err) {
      socket.emit("game:error", "Resignation failed.");
    }
  });

  socket.on("game:abort", async ({ gameId }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return socket.emit("game:error", "Unauthorized");

      const game = await Game.findOneAndDelete({ _id: gameId, userId: user._id });

      if (!game) return socket.emit("game:error", "Game not found.");

      socket.emit("game:aborted_success");
    } catch (err) {
      socket.emit("game:error", "Abortion failed.");
    }
  });
}

async function handleEngineMove(gameId, game, socket, io) {
  try {
    const moveHistory = game.moves.map(m => `${m.from}${m.to}${m.promotion || ""}`);
    
    let bestMoveStr = getBookMove(game.opening, moveHistory);

    if (!bestMoveStr) {
      bestMoveStr = await getEngineBestMove(moveHistory);
    }

    const chess = new Chess(game.currentFen);
    const move = chess.move(bestMoveStr);

    if (!move) throw new Error("Engine suggested illegal move");

    game.moves.push({
      moveNumber: game.moves.length + 1,
      from: move.from,
      to: move.to,
      piece: move.piece,
      notation: move.san,
      fenAfter: chess.fen()
    });
    game.currentFen = chess.fen();

    if (chess.isGameOver()) {
      game.status = "completed";
      game.result = getResult(chess);
    }

    await game.save();

    io.to(`game-${gameId}`).emit("game:engine_move", { 
      move: bestMoveStr, 
      fen: game.currentFen,
      isGameOver: game.status === "completed",
      result: game.result
    });

  } catch (err) {
    console.error("Engine Move Error:", err);
    socket.emit("game:error", "Engine failed to respond.");
  }
}

function getEngineBestMove(historyArr) {
  return new Promise((resolve, reject) => {
    const historyString = historyArr.join(" ");
    const engine = spawn(getEnginePath(), [], { cwd: getEnginePwd() });
    let moveFound = false;
    let commandsSent = false;
    engine.stdin.write("uci\n");
    let wholeOutput = '';
    engine.stdout.on("data", (data) => {
      const output = data.toString();
      console.log("Engine output", output);
      wholeOutput += output;
      if (wholeOutput.includes("uciok") && !commandsSent) {
        commandsSent = true;
        engine.stdin.write(`position startpos moves ${historyString}\n`);
        engine.stdin.write("go movetime 3000\n");
      }
      const match = wholeOutput.match(/bestmove\s(\w{4,5})/);
      if (match) {
        moveFound = true;
        const move = match[1];
        engine.kill();
        resolve(move);
      }
    });

    engine.on("error", (err) => reject(err));
    
    setTimeout(() => {
      if (!moveFound) {
        engine.kill();
        reject(new Error("Engine timeout"));
      }
    }, 10000);
  });
}

function getResult(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? 'black' : 'white';
  if (chess.isDraw()) return 'draw';
  return null;
}