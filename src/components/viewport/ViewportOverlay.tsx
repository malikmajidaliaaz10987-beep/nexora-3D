import React, { useState, useEffect } from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  Camera,
  Play,
  Pause,
  Grid,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Eye,
  Crosshair,
  Download,
} from 'lucide-react';

interface ViewportOverlayProps {
  currentTransformMode: 'translate' | 'rotate' | 'scale';
  onSetTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  onSetCameraView: (preset: 'perspective' | 'front' | 'top' | 'side' | 'isometric') => void;
  onResetCamera: () => void;
  isTurntableActive: boolean;
  onToggleTurntable: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onCaptureSnapshot: () => void;
  selectedObjectName?: string | null;
  polyCount?: number;
}

export const ViewportOverlay: React.FC<ViewportOverlayProps> = ({
  currentTransformMode,
  onSetTransformMode,
  onSetCameraView,
  onResetCamera,
  isTurntableActive,
  onToggleTurntable,
  showGrid,
  onToggleGrid,
  onCaptureSnapshot,
  selectedObjectName,
  polyCount = 3840,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCamPreset, setActiveCamPreset] = useState<'perspective' | 'front' | 'top' | 'side' | 'isometric'>('perspective');

  // Keyboard shortcut 'H' to toggle HUD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectCam = (preset: 'perspective' | 'front' | 'top' | 'side' | 'isometric') => {
    setActiveCamPreset(preset);
    onSetCameraView(preset);
  };

  return (
    <>
      {/* Minimal Top-Left Scene Spec Badge (Zero occlusion) */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-1">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg px-3 py-1.5 flex items-center gap-3 backdrop-blur-sm pointer-events-auto shadow-md">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>{selectedObjectName ? `Target: ${selectedObjectName}` : 'Orbit Navigation'}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-800" />
          <div className="text-[11px] font-mono text-slate-400">
            {polyCount.toLocaleString()} Polys
          </div>
        </div>
      </div>

      {/* Top-Right Zen Mode Indicator / Shortcut Tip */}
      <div className="absolute top-4 right-4 pointer-events-none z-10 hidden sm:flex items-center gap-2">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded px-2 py-1 text-[11px] font-mono text-slate-400">
          Press <kbd className="text-cyan-400 font-bold px-1 bg-slate-900 border border-slate-700 rounded">H</kbd> to toggle HUD
        </div>
      </div>

      {/* Unified Bottom Control Dock (100% Unobstructed Center Viewport) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto transition-transform duration-300 ease-out"
        style={{
          transform: isCollapsed ? 'translate(-50%, calc(100% - 24px))' : 'translate(-50%, 0)',
          maxWidth: 'min(940px, 94vw)',
          width: 'max-content',
        }}
      >
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 px-3 py-1 bg-slate-900/95 border border-slate-700/80 border-b-0 rounded-t-lg text-[11px] font-mono text-slate-300 hover:text-cyan-400 transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {/* Horizontal Dock Strip */}
        <div className="bg-slate-950/95 border border-slate-800/90 rounded-2xl p-2 flex flex-wrap items-center gap-2 sm:gap-3 backdrop-blur-md shadow-2xl">
          {/* Transform Modes */}
          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800/80">
            <button
              onClick={() => onSetTransformMode('translate')}
              title="Move (Translate)"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentTransformMode === 'translate'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetTransformMode('rotate')}
              title="Rotate"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentTransformMode === 'rotate'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetTransformMode('scale')}
              title="Scale"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                currentTransformMode === 'scale'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Camera View Angle Presets */}
          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800/80">
            {(['perspective', 'front', 'top', 'side', 'isometric'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleSelectCam(preset)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono capitalize transition-all cursor-pointer ${
                  activeCamPreset === preset
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset === 'perspective' ? 'Persp' : preset === 'isometric' ? 'Iso' : preset}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-slate-800" />

          {/* Turntable Auto-spin */}
          <button
            onClick={onToggleTurntable}
            title={isTurntableActive ? 'Pause Turntable' : 'Play Turntable'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              isTurntableActive
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isTurntableActive ? <Pause className="w-3.5 h-3.5 text-purple-400" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Turntable</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={onToggleGrid}
            title="Toggle Grid Ground"
            className={`p-1.5 rounded-xl text-xs border transition-colors cursor-pointer ${
              showGrid
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            title="Reset Camera Target"
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Capture Snapshot */}
          <button
            onClick={onCaptureSnapshot}
            title="Take High-Res Screenshot"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Snapshot</span>
          </button>
        </div>
      </div>
    </>
  );
};
