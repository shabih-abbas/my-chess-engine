import King from "../assets/king-w.svg";

export default function Loading() {
  return (
    <main className="min-h-screen bg-chess-board flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center">
        
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-2 border-white/5 border-t-chess-gold animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <img src={King} alt="King" className="w-8 h-8 text-chess-gold animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-white/80 font-bold uppercase tracking-[0.3em] text-xs mb-4">
            Initializing Engine
          </h2>
          
        </div>
      </div>
    </main>
  );
}