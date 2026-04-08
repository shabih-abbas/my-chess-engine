import React from 'react';
import { Link } from 'react-router';
import King from '../assets/king-w.svg'
import Pawn from '../assets/pawn-b.svg'
import Knight from '../assets/knight-w.svg'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-chess-pattern relative overflow-x-hidden">
      <div className="fixed inset-0 bg-black/50 pointer-events-none" />

      <div className="relative z-10">
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-8 w-24 h-24 md:w-32 md:h-32 drop-shadow-[0_0_20px_rgba(196,164,106,0.6)]">
            <img src={King} alt="Chess King" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter mb-6">
            MY CHESS <span className="text-chess-gold">ENGINE</span>
          </h1>
          
          <p className="text-chess-wood-light text-xl md:text-2xl font-medium max-w-2xl mb-12 opacity-90">
            Master the Board with Precision. Experience the next generation of chess analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
            <button className="btn-gold flex-1 text-2xl py-5 flex items-center justify-center gap-4 group">
              <img src={Pawn} alt="" className="w-7 h-7 group-hover:-translate-y-1 transition-transform" />
              New Game
            </button>
            <Link to='login' className="glass-panel flex-1 text-2xl py-5 text-white font-semibold flex items-center justify-center gap-4 hover:bg-white/20 transition-all">
              <img src={Knight} alt="" className="w-7 h-7" />
              Login
            </Link>
          </div>
        </section>

        <section className="py-24 bg-[#1a1714]/90 backdrop-blur-sm border-y border-white/5">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-chess-gold font-bold text-xl uppercase tracking-widest">Computer Engine</h3>
              <p className="text-chess-wood-light leading-relaxed">
                Challenge yourself against a computer that caculates the best moves at each turn and level up your skill.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-chess-gold font-bold text-xl uppercase tracking-widest">Deep Analysis</h3>
              <p className="text-chess-wood-light leading-relaxed">
                Improve with instant feedback on every move, identifying blunders and suggesting the optimal line.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-chess-gold font-bold text-xl uppercase tracking-widest">MERN Performance</h3>
              <p className="text-chess-wood-light leading-relaxed">
                Full-stack architecture for real-time responsiveness and secure data management.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">Ready to make your move?</h2>
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div className="glass-panel p-6">
              <span className="text-chess-gold text-3xl font-bold block mb-2">01</span>
              <p className="text-white/70">Create your profile to save your games and custom settings.</p>
            </div>
            <div className="glass-panel p-6">
              <span className="text-chess-gold text-3xl font-bold block mb-2">02</span>
              <p className="text-white/70">Play against the engine or upload a PGN for deep analysis.</p>
            </div>
            <div className="glass-panel p-6">
              <span className="text-chess-gold text-3xl font-bold block mb-2">03</span>
              <p className="text-white/70">Use our opening book to brush up your theory.</p>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t border-white/5 text-center">
          <p className="text-white/40 text-sm tracking-widest uppercase">
            © 2026 My Chess Engine. Built with React & Node.js.
          </p>
        </footer>
      </div>

      <img src="/assets/queen-white.svg" className="absolute -top-24 -right-24 w-96 opacity-5 pointer-events-none rotate-12" alt="" />
      <img src="/assets/rook-white.svg" className="absolute bottom-24 -left-24 w-80 opacity-5 pointer-events-none -rotate-12" alt="" />
    </div>
  );
}