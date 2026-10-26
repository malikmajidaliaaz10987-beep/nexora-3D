import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Sliders,
  CheckCircle2,
  Box,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { MATERIAL_PRESETS } from '../../lib/three/materials';
import { PBRMaterialData } from '../../types/project';

interface MaterialAssistantViewProps {
  onApplyMaterialToStudio?: (material: PBRMaterialData) => void;
  onGoToStudio?: () => void;
}

export const MaterialAssistantView: React.FC<MaterialAssistantViewProps> = ({
  onApplyMaterialToStudio,
  onGoToStudio,
}) => {
  const [materialPrompt, setMaterialPrompt] = useState(
    'Anodized aerospace titanium with iridescent cyan sheen, micro brushed grain, and clearcoat gloss'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  const handleSynthesizeMaterial = async () => {
    setIsGenerating(true);
    setAppliedFeedback(false);

    try {
      const response = await fetch('/api/ai/material-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialPrompt }),
      });

      const data = await response.json();
      setActiveMaterial(data.material);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (matData: PBRMaterialData) => {
    if (onApplyMaterialToStudio) {
      onApplyMaterialToStudio(matData);
      setAppliedFeedback(true);
      setTimeout(() => setAppliedFeedback(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">AI MATERIAL ASSISTANT</h2>
          <span className="text-xs font-mono text-pink-400 px-2 py-0.5 rounded bg-pink-950/60 border border-pink-500/30">
            PBR Shader Synthesizer
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Describe any physical finish or texture in natural language. NEXORA computes physically accurate roughness, metalness, clearcoat, and procedural canvas texture shaders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Synthesizer Form */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Material Description</label>
            <textarea
              rows={3}
              value={materialPrompt}
              onChange={(e) => setMaterialPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-pink-500/60 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSynthesizeMaterial}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs hover:bg-pink-400 transition-all cursor-pointer shadow-lg shadow-pink-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing PBR Shader...' : 'Generate PBR Material'}</span>
          </button>

          <div className="h-[1px] bg-slate-800" />

          {/* Preset Swatches */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
              CURATED STUDIO PRESETS:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setActiveMaterial({
                      materialName: preset.name,
                      ...preset.data,
                      designExplanation: `Ready-to-use ${preset.category} shader with tuned physical coefficients.`,
                    });
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-900 transition-all text-left cursor-pointer group"
                >
                  <div
                    className="w-4 h-4 rounded-full border border-slate-700 shrink-0"
                    style={{ backgroundColor: preset.data.color }}
                  />
                  <div className="min-w-0">
                    <span className="text-xs text-slate-300 block truncate group-hover:text-pink-300 font-medium">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{preset.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Synthesized Shader Inspector */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-200">SHADER SPECIFICATION</span>
              <span className="text-[11px] font-mono text-pink-400">
                {activeMaterial ? 'ACTIVE PBR' : 'STANDBY'}
              </span>
            </div>

            {activeMaterial ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-pink-500/40">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{activeMaterial.materialName}</h4>
                    <div
                      className="w-5 h-5 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: activeMaterial.color }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activeMaterial.designExplanation}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">ROUGHNESS</span>
                    <span className="text-pink-400 font-bold">{activeMaterial.roughness}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">METALNESS</span>
                    <span className="text-pink-400 font-bold">{activeMaterial.metalness}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">CLEARCOAT</span>
                    <span className="text-slate-200 font-bold">{activeMaterial.clearcoat ?? 0.5}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">PROCEDURAL TEXTURE</span>
                    <span className="text-cyan-400 font-bold truncate block">
                      {activeMaterial.proceduralTexture || 'None'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleApply(activeMaterial)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs hover:bg-pink-400 transition-colors cursor-pointer shadow-lg shadow-pink-950"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{appliedFeedback ? 'Applied to 3D Scene Object!' : 'Apply Material to 3D Scene'}</span>
                  </button>

                  {onGoToStudio && (
                    <button
                      onClick={onGoToStudio}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs hover:text-white transition-colors cursor-pointer"
                    >
                      <Box className="w-4 h-4 text-cyan-400" />
                      <span>View in 3D Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Palette className="w-10 h-10 mx-auto opacity-30 text-pink-400" />
                <p className="text-xs">Describe or select a material to inspect.</p>
                <p className="text-[11px] text-slate-600">
                  Outputs standard Three.js MeshPhysicalMaterial configurations.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Procedural textures are rendered on HTML5 2D Canvas without external image files.
          </div>
        </div>
      </div>
    </div>
  );
};
