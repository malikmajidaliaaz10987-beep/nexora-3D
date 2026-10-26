import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Wand2,
  Box,
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Palette,
  Shield,
} from 'lucide-react';
import { StructuredPrompt, DEFAULT_STRUCTURED_PROMPT, VisualStyle } from '../../types/prompt';
import { addGenerationHistory, saveProject } from '../../lib/storage/projectStorage';
import { ProjectScene } from '../../types/project';

interface TextTo3DViewProps {
  onOpenInStudio: (project: ProjectScene) => void;
}

export const TextTo3DView: React.FC<TextTo3DViewProps> = ({ onOpenInStudio }) => {
  const [promptData, setPromptData] = useState<StructuredPrompt>(DEFAULT_STRUCTURED_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const styleOptions: { id: VisualStyle; name: string }[] = [
    { id: 'cyberpunk_sci_fi', name: 'Cyberpunk & Sci-Fi' },
    { id: 'industrial_hard_surface', name: 'Industrial Hard-Surface' },
    { id: 'photorealistic_pbr', name: 'Photorealistic PBR' },
    { id: 'anime_mecha', name: 'Anime Mecha' },
    { id: 'stylized_low_poly', name: 'Stylized Low-Poly' },
    { id: 'minimalist_nordic', name: 'Minimalist Clean' },
    { id: 'biomorphic_organic', name: 'Biomorphic / Organic' },
    { id: 'retro_futurism', name: 'Retro Futurism' },
  ];

  const handleGenerate = async () => {
    if (!promptData.subject.trim()) {
      setErrorMessage('Please enter a model subject description.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedResult(null);
    setProgressPercent(15);
    setGenerationStep('Validating spatial prompt structure...');

    try {
      setTimeout(() => {
        setProgressPercent(45);
        setGenerationStep('Synthesizing 3D composite spatial hierarchy...');
      }, 500);

      const response = await fetch('/api/ai/text-to-3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredPrompt: promptData }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to synthesize 3D blueprint');
      }

      setProgressPercent(80);
      setGenerationStep('Assembling Three.js geometries & PBR shaders...');

      setTimeout(() => {
        setProgressPercent(100);
        setGenerationStep('3D Model Synthesis Complete!');
        setGeneratedResult(data);
        setIsGenerating(false);

        // Convert generated parts into a full ProjectScene
        const blueprint = data.blueprint;
        const newProject: ProjectScene = {
          id: `proj_ai_${Date.now()}`,
          name: blueprint.modelTitle || promptData.subject,
          description: blueprint.description || `Generated from: "${promptData.subject}"`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          polyCount: (blueprint.parts?.length || 4) * 480,
          lighting: {
            keyLight: { color: promptData.colorPalette[0] || '#ffffff', intensity: 2.2, position: [5, 6, 4], castShadow: true },
            fillLight: { color: promptData.colorPalette[1] || '#06b6d4', intensity: 1.2, position: [-5, 3, -3] },
            rimLight: { color: '#8b5cf6', intensity: 1.5, position: [0, 5, -5] },
            hemisphere: { skyColor: '#0ea5e9', groundColor: '#0f172a', intensity: 0.6 },
            ambientIntensity: 0.35,
            environmentPreset: 'studio',
            showGrid: true,
            showFloor: true,
            fog: { enabled: true, color: '#0a0e17', near: 12, far: 35 },
          },
          camera: {
            position: [4, 3, 5],
            target: [0, 1.2, 0],
            fov: 45,
          },
          tags: [promptData.category, promptData.visualStyle, 'AI Generated'],
          objects: (blueprint.parts || []).map((part: any, idx: number) => ({
            id: `part_${Date.now()}_${idx}`,
            name: part.name || `Component_${idx + 1}`,
            type: part.primitiveType || 'cube',
            transform: {
              position: part.position || [0, 0.5 + idx * 0.4, 0],
              rotation: part.rotation || [0, 0, 0],
              scale: part.scale || [1, 1, 1],
            },
            material: {
              color: part.material?.color || promptData.colorPalette[0] || '#06b6d4',
              roughness: part.material?.roughness ?? 0.25,
              metalness: part.material?.metalness ?? 0.85,
              clearcoat: part.material?.clearcoat ?? 0.5,
              emissive: part.material?.emissive,
              proceduralTexture: part.material?.proceduralTexture || 'none',
            },
            visible: true,
          })),
        };

        // Save project & log in history
        saveProject(newProject);
        addGenerationHistory({
          type: 'text_to_3d',
          prompt: promptData.subject,
          status: 'completed',
          resultSummary: `${blueprint.parts?.length || 5} component 3D assembly generated`,
          projectSnapshot: newProject,
        });
      }, 600);
    } catch (err: any) {
      setIsGenerating(false);
      setErrorMessage(err.message || 'Generation error');
      addGenerationHistory({
        type: 'text_to_3d',
        prompt: promptData.subject,
        status: 'failed',
        resultSummary: err.message,
      });
    }
  };

  const handleOpenStudio = () => {
    if (!generatedResult) return;
    const blueprint = generatedResult.blueprint;
    const newProject: ProjectScene = {
      id: `proj_ai_${Date.now()}`,
      name: blueprint.modelTitle || promptData.subject,
      description: blueprint.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      polyCount: (blueprint.parts?.length || 4) * 480,
      lighting: {
        keyLight: { color: promptData.colorPalette[0] || '#ffffff', intensity: 2.2, position: [5, 6, 4], castShadow: true },
        fillLight: { color: promptData.colorPalette[1] || '#06b6d4', intensity: 1.2, position: [-5, 3, -3] },
        rimLight: { color: '#8b5cf6', intensity: 1.5, position: [0, 5, -5] },
        hemisphere: { skyColor: '#0ea5e9', groundColor: '#0f172a', intensity: 0.6 },
        ambientIntensity: 0.35,
        environmentPreset: 'studio',
        showGrid: true,
        showFloor: true,
        fog: { enabled: true, color: '#0a0e17', near: 12, far: 35 },
      },
      camera: { position: [4, 3, 5], target: [0, 1.2, 0], fov: 45 },
      tags: [promptData.category, promptData.visualStyle, 'AI Generated'],
      objects: (blueprint.parts || []).map((part: any, idx: number) => ({
        id: `part_${Date.now()}_${idx}`,
        name: part.name || `Component_${idx + 1}`,
        type: part.primitiveType || 'cube',
        transform: {
          position: part.position || [0, 0.5 + idx * 0.4, 0],
          rotation: part.rotation || [0, 0, 0],
          scale: part.scale || [1, 1, 1],
        },
        material: {
          color: part.material?.color || '#06b6d4',
          roughness: part.material?.roughness ?? 0.25,
          metalness: part.material?.metalness ?? 0.85,
          clearcoat: part.material?.clearcoat ?? 0.5,
          proceduralTexture: part.material?.proceduralTexture || 'none',
        },
        visible: true,
      })),
    };

    onOpenInStudio(newProject);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title & Introduction */}
      <div>
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">TEXT-TO-3D CREATOR</h2>
          <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
            Structured Spatial AI
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Enter a description and configure structured spatial parameters. NEXORA synthesizes real 3D geometric assemblies with PBR physical shaders, ready for interactive manipulation and GLB export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Structured Prompt Form */}
        <div className="lg:col-span-2 space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          {/* Main Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Subject & Concept Description</span>
              <span className="text-[10px] font-mono text-cyan-400">Required</span>
            </label>
            <textarea
              rows={3}
              value={promptData.subject}
              onChange={(e) => setPromptData({ ...promptData, subject: e.target.value })}
              placeholder="e.g., Cybernetic Combat Drone with quad ducted fans, front optical sensor and carbon armor..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Category & Visual Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Asset Category</label>
              <select
                value={promptData.category}
                onChange={(e) => setPromptData({ ...promptData, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none"
              >
                <option value="vehicle">Vehicle / Aerocraft</option>
                <option value="character">Character / Mecha</option>
                <option value="prop">Prop / Weapon / Hardware</option>
                <option value="architecture">Architecture / Structure</option>
                <option value="abstract">Abstract / Artifact</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Visual Style</label>
              <select
                value={promptData.visualStyle}
                onChange={(e) => setPromptData({ ...promptData, visualStyle: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none"
              >
                {styleOptions.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Proportions & Level of Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Proportions & Silhouette</label>
              <select
                value={promptData.proportions}
                onChange={(e) => setPromptData({ ...promptData, proportions: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="balanced">Balanced Humanoid / Industrial</option>
                <option value="chunky_exaggerated">Heavy Armored / Bulky</option>
                <option value="slender_aerodynamic">Slender & Aerodynamic</option>
                <option value="miniature">Compact Tactical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Level of Detail (LOD)</label>
              <select
                value={promptData.levelOfDetail}
                onChange={(e) => setPromptData({ ...promptData, levelOfDetail: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              >
                <option value="high_fidelity">High Fidelity (Multi-part Assembly)</option>
                <option value="medium_optimized">Medium Optimized (Game Ready)</option>
                <option value="low_poly">Clean Low-Poly</option>
              </select>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Primary Color Palette</span>
              <span className="text-[10px] text-slate-500">Pick surface & accent colors</span>
            </label>
            <div className="flex items-center gap-3">
              {promptData.colorPalette.map((col, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <input
                    type="color"
                    value={col}
                    onChange={(e) => {
                      const updated = [...promptData.colorPalette];
                      updated[idx] = e.target.value;
                      setPromptData({ ...promptData, colorPalette: updated });
                    }}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-400">{col}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Negative Constraints */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Negative Constraints</label>
            <input
              type="text"
              value={promptData.negativeConstraints}
              onChange={(e) => setPromptData({ ...promptData, negativeConstraints: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Output: <span className="text-cyan-400 font-mono font-medium">Real 3D Mesh / Composite</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #38bdf8)',
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing 3D Model...' : 'Generate 3D Model'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Generation Progress & Results Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-200">GENERATION PIPELINE</span>
              <span className="text-[11px] font-mono text-slate-400">
                {isGenerating ? `${progressPercent}%` : generatedResult ? 'READY' : 'IDLE'}
              </span>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* In Progress */}
            {isGenerating && (
              <div className="space-y-3 py-6 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">{generationStep}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Generating physical geometries & coordinates</p>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Result Preview */}
            {!isGenerating && generatedResult && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3D Geometry Successfully Built</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">
                    {generatedResult.blueprint?.modelTitle}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {generatedResult.blueprint?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400">SYNTHESIZED SUB-COMPONENTS:</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {(generatedResult.blueprint?.parts || []).map((part: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-300 font-mono text-[11px]">{part.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{part.primitiveType}</span>
                          <div
                            className="w-3 h-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: part.material?.color || '#06b6d4' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleOpenStudio}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors cursor-pointer shadow-lg shadow-cyan-950"
                >
                  <Box className="w-4 h-4" />
                  <span>Launch in 3D Studio Viewport</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && !generatedResult && !errorMessage && (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Box className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
                <p className="text-xs">No model generated yet.</p>
                <p className="text-[11px] text-slate-600">
                  Configure the fields on the left and click "Generate 3D Model".
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Provider: Nexora & Gemini 3.8</span>
            <span className="text-emerald-400 font-mono">100% Real Geometry</span>
          </div>
        </div>
      </div>
    </div>
  );
};
