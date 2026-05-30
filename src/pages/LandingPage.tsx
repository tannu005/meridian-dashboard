import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataLandscape } from '../components/DataLandscape';
import { useThemeStore } from '../store/themeStore';

export function LandingPage() {
  const navigate = useNavigate();
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const isDarkMode = activeTheme !== 'light';

  // Bouncy spring transition for Framer Motion
  const springTransition = {
    type: "spring" as const,
    stiffness: 200,
    damping: 15,
    bounce: 0.5
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-1000 ${isDarkMode ? 'bg-[#0a0a0c] text-white' : 'bg-[#FDFBF7] text-zinc-900'} font-sans relative overflow-x-hidden`}>
      
      {/* Interactive 3D Background */}
      <DataLandscape isDarkMode={isDarkMode} />

      {/* Navigation & Theme Toggle */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 rounded bg-orange-400 flex items-center justify-center font-bold text-white font-serif shadow-lg shadow-orange-500/20">M</div>
          <span className={`font-bold tracking-widest uppercase text-sm ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Meridian
          </span>
        </div>
        
        <button 
          onClick={() => setTheme(activeTheme === 'light' ? 'meridian-dark' : 'light')}
          className={`pointer-events-auto px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${
            isDarkMode ? 'border-zinc-800 hover:border-orange-400 text-zinc-400 hover:text-orange-400' 
                       : 'border-zinc-300 hover:border-orange-500 text-zinc-500 hover:text-orange-500 bg-white/50 backdrop-blur-sm'
          }`}
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none">
        
        {/* Subtle gradient overlay to ensure text readability over 3D scene */}
        <div className={`absolute inset-0 bg-gradient-to-b ${isDarkMode ? 'from-[#0a0a0c]/60 via-transparent to-[#0a0a0c]' : 'from-[#FDFBF7]/60 via-transparent to-[#FDFBF7]'} z-10`}></div>

        <div className="relative z-20 text-center max-w-4xl px-4 flex flex-col items-center pointer-events-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...springTransition, delay: 0.2 }}
            className={`text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 ${isDarkMode ? 'text-white drop-shadow-2xl' : 'text-zinc-900 drop-shadow-xl'}`}
          >
            Finance Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">Simple.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: 0.4 }}
            className={`text-lg md:text-xl mb-12 max-w-2xl font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}
          >
            A recruiter-ready, institutional-grade portfolio analytics dashboard. 
            Powered by an interactive 3D data landscape and stunning spring physics.
          </motion.p>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -4, boxShadow: "0 20px 40px -10px rgba(251, 146, 60, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ ...springTransition, delay: 0.6 }}
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-colors flex items-center gap-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-xl shadow-orange-500/20"
          >
            Enter Dashboard
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </motion.button>
        </div>
      </section>

      {/* 3-Column Features Section */}
      <section className={`py-24 px-6 md:px-12 relative z-20 border-t transition-colors duration-1000 ${isDarkMode ? 'border-zinc-900 bg-[#0a0a0c]' : 'border-zinc-200 bg-[#FDFBF7]'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Feature 1 */}
          <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-2 duration-300 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50 hover:border-orange-500/30' : 'border-white bg-white shadow-xl shadow-zinc-200/50 hover:border-orange-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Real-time Market Tracker</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              A persistent top-level banner featuring live index tickers and glowing animations that react instantaneously to data streams.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-2 duration-300 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50 hover:border-rose-500/30' : 'border-white bg-white shadow-xl shadow-zinc-200/50 hover:border-rose-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-500'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Beginner-Friendly Tooltips</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Institutional terminology is decoded instantly via guided hover states and a comprehensive Financial Glossary overlay.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-2 duration-300 ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50 hover:border-purple-500/30' : 'border-white bg-white shadow-xl shadow-zinc-200/50 hover:border-purple-200'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 5-5-3-5 3"/><path d="m17 19-5 3-5-3"/><path d="M2 12h20"/><path d="m5 17-3-5 3-5"/><path d="m19 17 3-5-3-5"/></svg>
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Premium Animated UI</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Built on React Grid Layout with GSAP and Framer Motion, delivering fluid drag-and-drop physics and bouncy interactions.
            </p>
          </div>

        </div>
      </section>
      
    </div>
  );
}
