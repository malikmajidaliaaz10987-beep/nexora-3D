import React from 'react';
import {
  Box,
  Compass,
  Layers,
  FolderKanban,
  Settings,
  Sparkles,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { AppSettings } from '../../lib/storage/projectStorage';

export type NavTab = 'home' | 'create' | 'studio' | 'projects' | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  settings: AppSettings;
  activeProjectName?: string;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  activeProjectName,
  onNewProject,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'create', label: 'Create AI', icon: <Sparkles className="w-4 h-4 text-cyan-400" /> },
    { id: 'studio', label: '3D Studio', icon: <Box className="w-4 h-4" /> },
    { id: 'projects', label: 'My Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${settings.themeAccent}, #8b5cf6)`,
              boxShadow: `0 0 16px ${settings.themeAccent}33`,
            }}
          >
            <Box className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-slate-100 flex items-center gap-1.5">
              {settings.appName}
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-400">
                PRO 3D
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight -mt-0.5">
              {settings.customBrandSubtext}
            </span>
          </div>
        </button>

        {activeProjectName && (
          <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400">
            <span className="text-slate-500 font-mono">SCENE:</span>
            <span className="text-slate-200 font-medium truncate max-w-[140px]">
              {activeProjectName}
            </span>
          </div>
        )}
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/60">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Action Hub */}
      <div className="flex items-center gap-2.5">
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          <Cpu className="w-3.5 h-3.5" />
          <span>WebGL 2.0 PBR</span>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-950 transition-all cursor-pointer hover:brightness-110 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${settings.themeAccent}, #38bdf8)`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Model</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
};
