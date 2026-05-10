import AnalysisSession from "../models/AnalysisSession.js";
import Annotation from "../models/Annotation.js";
import Game from "../models/Game.js"; 

export async function getOrCreateSession(req, res) {
  try {
    let { gameId, depth } = req.body;
    const userId = req.user._id;

    if (!gameId) {
      const lastGame = await Game.findOne({ userId }).sort({ updatedAt: -1 });
      if (!lastGame) {
        return res.status(404).json({ message: "No games found to analyze." });
      }
      gameId = lastGame._id;
    }

    const game = await Game.findOne({ _id: gameId, userId });
    if (!game) {
      return res.status(403).json({ message: "Unauthorized: You do not own this game." });
    }

    const session = await AnalysisSession.findOne({ gameId, userId });

    if (!session || session.engineDepth !== depth) {
      if (session) {
        await AnalysisSession.findByIdAndDelete(session._id);
        await Annotation.deleteMany({ analysisId: session._id });
      }

      const newSession = await AnalysisSession.create({
        gameId,
        userId,
        status: "processing",
        engineDepth: depth
      });

      return res.status(201).json({ 
        sessionId: newSession._id, 
        gameId: game._id, 
        status: "processing",
        message: "Analysis session created." 
      });
    }

    if (session.status === "failed") {
      session.status = "processing";
      await session.save();
    }

    return res.status(200).json({ 
      sessionId: session._id, 
      gameId: game._id, 
      status: session.status,
      message: session.status === "completed" ? "Analysis ready." : "Analysis in progress."
    });

  } catch (err) {
    console.error("Session Controller Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}