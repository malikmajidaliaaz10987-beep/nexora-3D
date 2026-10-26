import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Box,
  Layers,
  ArrowRight,
  Sun,
  CloudFog,
  CheckCircle2,
} from 'lucide-react';
import { ProjectScene } from '../../types/project';
import { saveProject, addGenerationHistory } from '../../lib/storage/projectStorage';

interface SceneGeneratorViewProps {
  onOpenInStudio: (project: ProjectScene) => void;
}

export const SceneGeneratorView: React.FC<SceneGeneratorViewProps> = ({ onOpenInStudio }) => {
  const [scenePrompt, setScenePrompt] = useState('Cyberpunk High-Tech Hangar Bay with glowing energy pillars and landing platform');
  const [environmentType, setEnvironmentType] = useState<'cyberpunk' | 'nebula' | 'sunset' | 'studio' | 'clean_white'>('cyberpunk');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [generatedScene, setGeneratedScene] = useState<ProjectScene | null>(null);

  const envOptions = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon Bay', desc: 'Dark asphalt, cyan & magenta rim lights with horizon fog' },
    { id: 'nebula', name: 'Deep Nebula Void', desc: 'Cosmic violet glow with resonant floating monoliths' },
    { id: 'sunset', name: 'Solar Martian Outpost', desc: 'Warm amber key lighting with low-angle shadow casting' },
    { id: 'studio', name: 'Industrial Pro Studio', desc: 'Crisp studio lighting with dark neutral backdrop' },
  ];

  const handleSynthesizeScene = async () => {
    setIsSynthesizing(true);

    try {
      const response = await fetch('/api/ai/scene-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenePrompt, environmentType }),
      });

      const data = await response.json();
      const sceneData = data.scene;

      const newProject: ProjectScene = {
        id: `proj_scene_${Date.now()}`,
        name: sceneData.sceneTitle || 'Synthesized 3D Environment',
        description: scenePrompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        polyCount: (sceneData.elements?.length || 5) * 640,
        lighting: {
          keyLight: { color: sceneData.lighting?.keyLightColor || '#38bdf8', intensity: 2.6, position: [6, 8, 5], castShadow: true },
          fillLight: { color: sceneData.lighting?.fillLightColor || '#8b5cf6', intensity: 1.6, position: [-6, 4, -4] },
          rimLight: { color: sceneData.lighting?.rimLightColor || '#06b6d4', intensity: 1.8, position: [0, 6, -6] },
          hemisphere: { skyColor: '#0ea5e9', groundColor: '#0f172a', intensity: 0.7 },
          ambientIntensity: 0.35,
          environmentPreset: (sceneData.environmentPreset as any) || environmentType,
          showGrid: true,
          showFloor: true,
          fog: { enabled: true, color: sceneData.fogColor || '#030712', near: 10, far: 35 },
        },
        camera: { position: [7, 4.5, 8], target: [0, 1.5, 0], fov: 50 },
        tags: ['Environment', 'Scene', 'Multi-Object'],
        objects: (sceneData.elements || []).map((el: any, idx: number) => ({
          id: `elem_${Date.now()}_${idx}`,
          name: el.name || `Structure_${idx + 1}`,
          type: el.primitiveType === 'box' ? 'cube' : el.primitiveType || 'cube',
          transform: {
            position: el.position || [0, 0, 0],
            rotation: el.rotation || [0, 0, 0],
            scale: el.scale || [1, 1, 1],
          },
          material: {
            color: el.material?.color || '#06b6d4',
            roughness: el.material?.roughness ?? 0.3,
            metalness: el.material?.metalness ?? 0.8,
            emissive: el.material?.emissive,
          },
          visible: true,
        })),
      };

      saveProject(newProject);
      addGenerationHistory({
        type: 'scene',
        prompt: scenePrompt,
        status: 'completed',
        resultSummary: `Environment created with ${newProject.objects.length} spatial structures`,
        projectSnapshot: newProject,
      });

      setGeneratedScene(newProject);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">SCENE & ENVIRONMENT CREATOR</h2>
          <span className="text-xs font-mono text-teal-400 px-2 py-0.5 rounded bg-teal-950/60 border border-teal-500/30">
            Multi-Object World Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Synthesize full architectural scenes with grounded terrain platforms, lighting rigs, horizon fog, and coordinated props.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Scene Description</label>
            <textarea
              rows={3}
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-teal-500/60 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Atmosphere Rig Preset</label>
            <div className="grid grid-cols-1 gap-2">
              {envOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setEnvironmentType(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    environmentType === opt.id
                      ? 'bg-teal-950/60 border-teal-500/60 text-teal-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSynthesizeScene}
            disabled={isSynthesizing}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-all cursor-pointer shadow-lg shadow-teal-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSynthesizing ? 'Constructing Environment...' : 'Assemble 3D Environment'}</span>
          </button>
        </div>

        {/* Status / Output */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-200">SCENE BLUEPRINT</span>
              <span className="text-[11px] font-mono text-teal-400">
                {generatedScene ? 'BUILT' : 'STANDBY'}
              </span>
            </div>

            {generatedScene ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-teal-500/40">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3D Scene Coherently Assembled</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{generatedScene.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {generatedScene.objects.length} spatial structures placed in coordinate space.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400">SPATIAL ELEMENTS:</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {generatedScene.objects.map((obj) => (
                      <div
                        key={obj.id}
                        className="flex items-center justify-between text-xs bg-slate-950/80 p-2 rounded-lg border border-slate-800"
                      >
                        <span className="text-slate-300 font-mono text-[11px]">{obj.name}</span>
                        <div
                          className="w-3 h-3 rounded-full border border-slate-700"
                          style={{ backgroundColor: obj.material.color }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onOpenInStudio(generatedScene)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer shadow-lg shadow-teal-950"
                >
                  <Box className="w-4 h-4" />
                  <span>Explore Environment in 3D Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Compass className="w-10 h-10 mx-auto opacity-30 text-teal-400" />
                <p className="text-xs">Describe an environment and assemble.</p>
                <p className="text-[11px] text-slate-600">
                  Includes lighting, platforms, pillars, and volumetric fog.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Perimeter bound with natural atmospheric fog fade-off to prevent void exposure.
          </div>
        </div>
      </div>
    </div>
  );
};
