import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-xl">🍌</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              imagao
            </h1>
            <p className="text-xs text-slate-400">Powered by Basma Hassan</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300 border border-slate-700">
            AI Image Editor
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
