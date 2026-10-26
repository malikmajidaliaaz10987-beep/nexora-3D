import React from 'react';
import {
  Plus,
  Sun,
  Save,
  Download,
  RotateCcw,
  Sparkles,
  Camera,
  Layers,
  Check,
} from 'lucide-react';

interface ToolbarProps {
  onOpenAddModal: () => void;
  onOpenLightingModal: () => void;
  onSaveProject: () => void;
  isSaving?: boolean;
  onExportGLB: () => void;
  onResetScene: () => void;
  onTakeSnapshot: () => void;
  polyCount?: number;
  hasUnsavedChanges?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenAddModal,
  onOpenLightingModal,
  onSaveProject,
  isSaving = false,
  onExportGLB,
  onResetScene,
  onTakeSnapshot,
  polyCount = 3840,
  hasUnsavedChanges = false,
}) => {
  return (
    <div className="h-11 bg-slate-950/95 border-b border-slate-800/80 px-4 flex items-center justify-between z-20 select-none">
      {/* Left Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/60 transition-colors cursor-pointer shadow-sm shadow-cyan-950"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Object</span>
        </button>

        <button
          onClick={onOpenLightingModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:text-cyan-400 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Lighting & Fog</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={onSaveProject}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer"
        >
          {isSaving ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          <span>{isSaving ? 'Saved!' : 'Save Scene'}</span>
          {hasUnsavedChanges && !isSaving && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5" />
          )}
        </button>

        <button
          onClick={onExportGLB}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:text-purple-400 hover:border-purple-500/40 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>Export .GLB</span>
        </button>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTakeSnapshot}
          title="Capture Snapshot"
          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
        </button>

        <button
          onClick={onResetScene}
          title="Clear Scene"
          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <span className="text-slate-500">TRIANGLES:</span>
          <span className="text-cyan-400 font-semibold">{polyCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
