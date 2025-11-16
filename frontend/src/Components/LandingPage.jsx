import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

const LandingPage = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.05);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 via-yellow-800 to-gray-900 text-yellow-400 overflow-hidden flex items-center justify-center">
      {/* Background blur effects */}
      <div className="absolute top-20 left-1/4 w-32 h-32 bg-yellow-600 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-20 right-1/4 w-32 h-32 bg-yellow-500 rounded-full filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Main content container */}
      <div className="relative w-full h-full flex items-center justify-center px-4">
        {/* Animated band SVG - smaller and positioned better */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="700" width="1200" height="100" fill="rgba(0,0,0,0.5)" />
          <line x1="0" y1="700" x2="1200" y2="700" stroke="#ca8a04" strokeWidth="3" />

          {/* Singer */}
          <g transform={`translate(200, ${600 + Math.sin(time * 3) * 8})`}>
            <path d="M 0 -10 L -20 20 L -15 60 L 15 60 L 20 20 Z" fill="#1f2937" />
            <ellipse cx="0" cy="-30" rx="18" ry="22" fill="#eab308" />
            <path d={`M -18 -40 Q -28 -35 ${-35 + Math.sin(time * 4) * 10} -20 Q -38 0 ${-40 + Math.sin(time * 4 + 1) * 8} 20`} fill="#000" />
            <path d={`M 18 -40 Q 28 -35 ${35 + Math.sin(time * 4) * 10} -20 Q 38 0 ${40 + Math.sin(time * 4 + 1) * 8} 20`} fill="#000" />
            <circle cx="-5" cy="-32" r="2" fill="#000" />
            <circle cx="5" cy="-32" r="2" fill="#000" />
            <ellipse cx="0" cy="-25" rx="4" ry={6 + Math.sin(time * 8) * 3} fill="#ca8a04" />
            <rect x="-22" y="5" width="44" height="35" fill="#000" stroke="#ca8a04" strokeWidth="2" />
            <line x1="35" y1={-20 + Math.sin(time * 3) * 5} x2="35" y2="60" stroke="#4b5563" strokeWidth="2" />
            <ellipse cx="35" cy={-25 + Math.sin(time * 3) * 5} rx="6" ry="10" fill="#1f2937" stroke="#000" strokeWidth="1.5" />
            <path d="M -18 0 Q -25 10 -30 25" stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d={`M 18 0 Q 30 ${-5 + Math.sin(time * 3) * 5} 30 ${-15 + Math.sin(time * 3) * 5}`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <line x1="-8" y1="60" x2="-12" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <line x1="8" y1="60" x2="12" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <text x="50" y={-35 + Math.sin(time * 6) * 12} fontSize="20" fill="#ca8a04" opacity={0.6 + Math.sin(time * 6) * 0.4}>♪</text>
          </g>

          {/* Guitarist */}
          <g transform={`translate(400, ${600 + Math.sin(time * 2.5 + 1) * 10})`}>
            <path d="M 0 -10 L -18 20 L -12 60 L 12 60 L 18 20 Z" fill="#1f2937" />
            <ellipse cx={Math.sin(time * 5) * 4} cy="-30" rx="18" ry="22" fill="#eab308" />
            <circle cx={-5 + Math.sin(time * 5) * 4} cy="-32" r="2" fill="#000" />
            <circle cx={5 + Math.sin(time * 5) * 4} cy="-32" r="2" fill="#000" />
            <rect x="-20" y="5" width="40" height="30" fill="#000" stroke="#ca8a04" strokeWidth="2" />
            <path d={`M -18 10 Q -30 8 -40 5`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="-40" cy="5" r="5" fill="#eab308" />
            <path d={`M 18 15 Q 25 20 ${32 + Math.sin(time * 10) * 10} ${28 + Math.sin(time * 10) * 12}`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx={32 + Math.sin(time * 10) * 10} cy={28 + Math.sin(time * 10) * 12} r="5" fill="#eab308" />
            <ellipse cx="10" cy="42" rx="22" ry="30" fill="#ca8a04" stroke="#78350f" strokeWidth="3" />
            <circle cx="10" cy="42" r="10" fill="#422006" />
            <rect x="-42" y="3" width="52" height="5" fill="#1f2937" stroke="#000" strokeWidth="1" />
            <line x1="-6" y1="60" x2="-10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <line x1="6" y1="60" x2="10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
          </g>

          {/* Drummer */}
          <g transform={`translate(600, 615)`}>
            <path d="M 0 -10 L -18 15 L -12 50 L 12 50 L 18 15 Z" fill="#1f2937" />
            <ellipse cx="0" cy={-30 + Math.sin(time * 8) * 4} rx="18" ry="22" fill="#eab308" />
            <circle cx="-5" cy={-32 + Math.sin(time * 8) * 4} r="2" fill="#000" />
            <circle cx="5" cy={-32 + Math.sin(time * 8) * 4} r="2" fill="#000" />
            <rect x="-18" y="0" width="36" height="35" fill="#000" stroke="#ca8a04" strokeWidth="2" />
            <path d={`M -18 -5 Q -40 ${-15 + Math.sin(time * 10) * 12} ${-55 + Math.sin(time * 10) * 8} ${-25 + Math.sin(time * 10) * 18}`} stroke="#eab308" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d={`M 18 -5 Q 40 ${-15 + Math.sin(time * 10 + Math.PI) * 12} ${55 + Math.sin(time * 10 + Math.PI) * 8} ${-25 + Math.sin(time * 10 + Math.PI) * 18}`} stroke="#eab308" strokeWidth="8" fill="none" strokeLinecap="round" />
            <g transform="translate(-65, 35)">
              <ellipse cx="0" cy="15" rx="22" ry="12" fill="#1f2937" />
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="#000" stroke="#ca8a04" strokeWidth="2" />
            </g>
            <g transform="translate(65, 35)">
              <ellipse cx="0" cy="15" rx="22" ry="12" fill="#1f2937" />
              <ellipse cx="0" cy="0" rx="22" ry="8" fill="#000" stroke="#ca8a04" strokeWidth="2" />
            </g>
            <line x1="-6" y1="50" x2="-10" y2="80" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <line x1="6" y1="50" x2="10" y2="80" stroke="#000" strokeWidth="10" strokeLinecap="round" />
          </g>

          {/* Keyboardist */}
          <g transform={`translate(800, ${600 + Math.sin(time * 3.5 + 2) * 8})`}>
            <path d="M 0 -10 L -18 20 L -12 60 L 12 60 L 18 20 Z" fill="#1f2937" />
            <ellipse cx="0" cy="-30" rx="18" ry="22" fill="#eab308" />
            <rect x="-20" y="5" width="40" height="30" fill="#000" stroke="#ca8a04" strokeWidth="1" />
            <path d={`M -18 0 Q -30 25 ${-45 + Math.sin(time * 12) * 3} ${48 + Math.abs(Math.sin(time * 12)) * 6}`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d={`M 18 0 Q 30 25 ${45 + Math.sin(time * 12 + 2) * 3} ${48 + Math.abs(Math.sin(time * 12 + 2)) * 6}`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <rect x="-65" y="52" width="130" height="12" fill="#000" stroke="#ca8a04" strokeWidth="2" rx="2" />
            <line x1="-6" y1="60" x2="-10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <line x1="6" y1="60" x2="10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
          </g>

          {/* Violinist */}
          <g transform={`translate(1000, ${600 + Math.sin(time * 4 + 3) * 8})`}>
            <path d="M 0 -10 L -18 20 L -12 60 L 12 60 L 18 20 Z" fill="#1f2937" />
            <ellipse cx={Math.sin(time * 4) * 6} cy="-30" rx="18" ry="22" fill="#eab308" />
            <circle cx={-5 + Math.sin(time * 4) * 6} cy="-32" r="2" fill="#000" />
            <circle cx={5 + Math.sin(time * 4) * 6} cy="-32" r="2" fill="#000" />
            <rect x="-20" y="5" width="40" height="30" fill="#000" stroke="#ca8a04" strokeWidth="1" />
            <path d="M -18 0 Q -32 -8 -42 -10" stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d={`M 18 0 Q 40 ${-12 + Math.sin(time * 6) * 6} ${52 + Math.sin(time * 6) * 12} ${-15 + Math.sin(time * 6) * 4}`} stroke="#1f2937" strokeWidth="8" fill="none" strokeLinecap="round" />
            <line x1="-6" y1="60" x2="-10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
            <line x1="6" y1="60" x2="10" y2="90" stroke="#000" strokeWidth="10" strokeLinecap="round" />
          </g>

          {/* Amplifiers */}
          <rect x="50" y="620" width="80" height="100" fill="#1f2937" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="70" cy="650" r="8" fill={Math.sin(time * 5) > 0 ? "#ca8a04" : "#422006"} />
          <circle cx="110" cy="650" r="8" fill={Math.sin(time * 5 + 1) > 0 ? "#eab308" : "#78350f"} />

          <rect x="1070" y="620" width="80" height="100" fill="#1f2937" stroke="#ca8a04" strokeWidth="3" />
          <circle cx="1090" cy="650" r="8" fill={Math.sin(time * 5 + 1) > 0 ? "#ca8a04" : "#422006"} />
          <circle cx="1130" cy="650" r="8" fill={Math.sin(time * 5 + 2) > 0 ? "#eab308" : "#78350f"} />
        </svg>

        {/* Audio visualizer bars */}
        <div className="absolute bottom-16 left-0 right-0 flex items-end justify-center space-x-1 h-24 opacity-30">
          {[...Array(60)].map((_, i) => (
            <div key={i} className="w-2 bg-yellow-600" style={{ height: `${Math.abs(Math.sin(time * 5 + i * 0.2)) * 80 + 15}px`, transition: 'height 0.1s ease' }}></div>
          ))}
        </div>

        {/* Central sign-up card */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-gradient-to-br from-gray-900 via-yellow-900 to-gray-900 bg-opacity-95 border-4 border-yellow-600 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform pointer-events-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <Music className="mr-3 text-yellow-500" size={48} />
                <h1 className="text-5xl font-bold text-yellow-500">HarmoniaHub</h1>
              </div>

              <button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-4 px-12 rounded-lg transform hover:scale-110 transition-all shadow-xl text-2xl cursor-pointer">
                 Sign Up Now 
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;