import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import King from '../assets/king-w.svg'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-chess-pattern relative flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-black/60 pointer-events-none" />

      <div className="glass-panel relative z-10 w-full max-w-md p-10 flex flex-col items-center">
        <img src={King} alt="Chess King" className="w-16 h-16 mb-6 drop-shadow-[0_0_10px_rgba(196,164,106,0.5)]" />
        
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-chess-wood-light text-sm mb-6 text-center">Enter your credentials to access the engine</p>

        {error && (
          <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 text-xs py-3 px-4 rounded-lg mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs uppercase tracking-widest text-chess-gold font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-chess-gold transition-colors"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-chess-gold font-bold mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-chess-gold transition-colors pr-12"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-chess-gold/60 hover:text-chess-gold transition-colors text-xs font-bold uppercase"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-gold w-full py-4 text-lg mt-4">
            Sign In
          </button>
        </form>

        <p className="mt-8 text-chess-wood-light text-sm">
          Don't have an account? <Link to="/register" className="text-chess-gold hover:underline font-bold ml-1">Create Account</Link>
        </p>
      </div>
    </div>
  );
}