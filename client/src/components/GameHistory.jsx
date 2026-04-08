import React from 'react';
import { Link } from 'react-router';

export default function GameHistory({ games }) {
  return (
    <div className="glass-panel w-full overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="text-chess-gold font-bold uppercase tracking-widest text-sm">Recent Activity</h3>
        <span className="text-white/30 text-xs">{games.length} Games Found</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-tighter border-b border-white/5">
              <th className="px-6 py-4 font-medium">Opponent</th>
              <th className="px-6 py-4 font-medium">Color</th>
              <th className="px-6 py-4 font-medium">Result</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Analysis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.length > 0 ? games.map((game) => (
              <tr key={game._id} className="text-white/80 hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 font-medium">Engine Level 4</td>
                <td className="px-6 py-4 capitalize font-light">{game.playerColor}</td>
                <td className="px-6 py-4">
                  <Link to={`/analyze/${game._id}`}>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase cursor-pointer hover:brightness-125 transition-all ${
                      game.result === 'win' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                      game.result === 'loss' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                      'bg-chess-gold/10 text-chess-gold border border-chess-gold/20'
                    }`}>
                      {game.result}
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-white/50">
                  {new Date(game.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/analyze/${game._id}`}
                    className="inline-flex items-center gap-2 text-chess-gold opacity-60 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase hover:tracking-widest"
                  >
                    Review
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <p className="text-white/20 italic text-sm mb-4">No analysis history available.</p>
                  <Link to="/play" className="btn-gold px-6 py-2 text-xs">Start Your First Game</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}