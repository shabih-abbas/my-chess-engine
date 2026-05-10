import { Chess } from "chess.js";
import { spawn } from "child_process";
import Game from "../models/Game.js";
import Annotation from "../models/Annotation.js";
import AnalysisSession from "../models/AnalysisSession.js";
import { getAuthenticatedUser } from "../middleware/socketAuth.js";
import { getEnginePath, getEnginePwd } from "../utils/enginePath.js";

export default function analysisHandler(io, socket) {
  
  socket.on("analysis:init", async ({ sessionId }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return socket.emit("analysis:error", "Unauthorized.");

      const session = await AnalysisSession.findById(sessionId);
      if (!session || session.userId.toString() !== user._id.toString()) {
        return socket.emit("analysis:error", "Session not found.");
      }

      const [game, existingAnnotations] = await Promise.all([
        Game.findById(session.gameId),
        Annotation.find({ analysisId: sessionId }).sort({ moveNumber: 1 })
      ]);

      if (!game) return socket.emit("analysis:error", "Game not found.");

      socket.emit("analysis:sync_state", {
        moves: game.moves,
        annotations: existingAnnotations,
        status: session.status,
        depth: session.engineDepth
      });

      if (session.status !== "completed") {
        runBackgroundAnalysis(socket, session, game, existingAnnotations.length);
      }
    } catch (err) {
      console.error(err);
      socket.emit("analysis:error", "Failed to initialize analysis view.");
    }
  });

  socket.on("analysis:update_comment", async ({ annotationId, comment }) => {
    try {
      const user = await getAuthenticatedUser(socket);
      if (!user) return;

      const annotation = await Annotation.findById(annotationId).populate('analysisId');
      if (annotation && annotation.analysisId.userId.toString() === user._id.toString()) {
        annotation.comment = comment;
        await annotation.save();
        socket.emit("analysis:comment_saved", { annotationId, comment });
      }
    } catch (err) {
      socket.emit("analysis:error", "Could not save comment.");
    }
  });
}

/**
 * @param {Number} startIndex - Where to resume (if some moves were already analyzed)
 */
async function runBackgroundAnalysis(socket, session, game, startIndex) {
  try {
    let previousEval = startIndex > 0 ? 0 : 0; 
    
    if (startIndex > 0) {
      const lastAnnot = await Annotation.findOne({ 
        analysisId: session._id, 
        moveNumber: startIndex 
      });
      previousEval = lastAnnot ? lastAnnot.eval : 0;
    }

    for (let i = startIndex; i < game.moves.length; i++) {
      const move = game.moves[i];
      
      const engineResult = await pipeToCEngine(move.fenAfter, session.engineDepth);
      
      const turn = (i % 2 === 0) ? 'w' : 'b';
      engineResult.score *= (i % 2 === 0) ? -1 : 1
      const type = determineType(engineResult.score, previousEval, turn);

      const annotation = await Annotation.create({
        analysisId: session._id,
        moveNumber: i + 1,
        eval: engineResult.score,
        bestLine: engineResult.pv,
        annotationType: type,
        comment: "" 
      });

      previousEval = engineResult.score;

      socket.emit("analysis:move_ready", {
        annotation,
        progress: Math.round(((i + 1) / game.moves.length) * 100)
      });
    }

    session.status = "completed";
    await session.save();
    socket.emit("analysis:complete");
  } catch (err) {
    console.error("Engine Error:", err);
    session.status = "failed";
    await session.save();
    socket.emit("analysis:error", "Engine interrupted.");
  }
}

function pipeToCEngine(fen, depth) {
  return new Promise((resolve, reject) => {
    const engine = spawn(getEnginePath(), [], { cwd: getEnginePwd() });
    let result = { score: 0, pv: [] };
    const cpRegex = /score cp (-?\d+)/;
    
    const pvRegex = /pv ([a-h][1-8][a-h][1-8][qrbn]?(\s[a-h][1-8][a-h][1-8][qrbn]?)*)/;
    
    let commandsSent = false;
    let buffer = ''; 

    engine.stdin.write(`uci\n`);

    engine.stdout.on("data", (data) => {
        buffer += data.toString();
        let lines = buffer.split('\n');
        
        buffer = lines.pop(); 

        const processLine = (line) => {
            const depthMatch = line.match(/depth (\d+)/);
            const currentLineDepth = depthMatch ? parseInt(depthMatch[1]) : 0;

            if (line.includes("info") && currentLineDepth === depth) {
                const cpMatch = line.match(cpRegex);
                if (cpMatch) result.score = parseInt(cpMatch[1]);

                const pvMatch = line.match(pvRegex);
                if (pvMatch) result.pv = pvMatch[1].split(' ').slice(0, 5);
            }

            if (line.includes("bestmove")) {
                engine.kill();
                resolve(result);
            }
        };

        for (const line of lines) {
            if (line.includes("uciok") && !commandsSent) {
            commandsSent = true;
            engine.stdin.write(`position fen ${fen}\n`);
            engine.stdin.write(`go depth ${depth}\n`);
            continue;
            }
            if (commandsSent) processLine(line);
        }

        if (buffer.includes("bestmove")) {
            processLine(buffer);
        }
        });

    engine.on("error", reject);
    
    const timeoutId = setTimeout(() => {
      engine.kill();
      reject(new Error("Engine Analysis Timeout"));
    }, 20000);

    engine.on('exit', () => clearTimeout(timeoutId));
  });
}

function determineType(curr, prev, turn) {
  // Turn 'w' means White just made a move at an EVEN index
  // Turn 'b' means Black just made a move at an ODD index

  let loss;
  if (turn === 'w') {
    loss = prev - curr;
  } else {
    loss = curr - prev;
  }

  if (loss > 300) return 'blunder';
  if (loss > 100) return 'mistake';
  if (loss > 50)  return 'inaccuracy';
  if (loss <= 5)  return 'best';
  
  return 'good';
}