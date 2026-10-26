import React from 'react';
import {
  Sun,
  Moon,
  CloudFog,
  Grid,
  Sparkles,
  Layers,
  Sliders,
  Lamp,
} from 'lucide-react';
import { LightingConfig } from '../../types/project';

interface LightingEnvironmentPanelProps {
  lighting: LightingConfig;
  onChange: (updated: LightingConfig) => void;
  onClose: () => void;
}

export const LightingEnvironmentPanel: React.FC<LightingEnvironmentPanelProps> = ({
  lighting,
  onChange,
  onClose,
}) => {
  const presets: { id: LightingConfig['environmentPreset']; name: string; desc: string }[] = [
    { id: 'studio', name: 'Studio Dark', desc: 'Neutral product showcase studio with cool rim' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'High-contrast cyan & magenta neon arena' },
    { id: 'nebula', name: 'Deep Nebula', desc: 'Cosmic violet ambient with soft rim lighting' },
    { id: 'sunset', name: 'Solar Sunset', desc: 'Warm directional sunlight with amber bounce' },
    { id: 'clean_white', name: 'Clean Lab', desc: 'High-key clinical white industrial showroom' },
  ];

  const handlePresetSelect = (preset: LightingConfig['environmentPreset']) => {
    switch (preset) {
      case 'cyberpunk':
        onChange({
          ...lighting,
          environmentPreset: 'cyberpunk',
          keyLight: { ...lighting.keyLight, color: '#38bdf8', intensity: 2.5 },
          fillLight: { ...lighting.fillLight, color: '#ec4899', intensity: 1.8 },
          rimLight: { ...lighting.rimLight, color: '#8b5cf6', intensity: 2.0 },
          fog: { ...lighting.fog, color: '#030712' },
        });
        break;
      case 'nebula':
        onChange({
          ...lighting,
          environmentPreset: 'nebula',
          keyLight: { ...lighting.keyLight, color: '#c084fc', intensity: 2.0 },
          fillLight: { ...lighting.fillLight, color: '#06b6d4', intensity: 1.2 },
          rimLight: { ...lighting.rimLight, color: '#38bdf8', intensity: 1.6 },
          fog: { ...lighting.fog, color: '#0b091a' },
        });
        break;
      case 'sunset':
        onChange({
          ...lighting,
          environmentPreset: 'sunset',
          keyLight: { ...lighting.keyLight, color: '#f59e0b', intensity: 2.8 },
          fillLight: { ...lighting.fillLight, color: '#f43f5e', intensity: 1.4 },
          rimLight: { ...lighting.rimLight, color: '#38bdf8', intensity: 0.8 },
          fog: { ...lighting.fog, color: '#1c1017' },
        });
        break;
      case 'clean_white':
        onChange({
          ...lighting,
          environmentPreset: 'clean_white',
          keyLight: { ...lighting.keyLight, color: '#ffffff', intensity: 2.2 },
          fillLight: { ...lighting.fillLight, color: '#e2e8f0', intensity: 1.2 },
          rimLight: { ...lighting.rimLight, color: '#94a3b8', intensity: 1.0 },
          fog: { ...lighting.fog, color: '#f1f5f9' },
        });
        break;
      case 'studio':
      default:
        onChange({
          ...lighting,
          environmentPreset: 'studio',
          keyLight: { ...lighting.keyLight, color: '#ffffff', intensity: 2.2 },
          fillLight: { ...lighting.fillLight, color: '#06b6d4', intensity: 1.0 },
          rimLight: { ...lighting.rimLight, color: '#8b5cf6', intensity: 1.4 },
          fog: { ...lighting.fog, color: '#0a0e17' },
        });
        break;
    }
  };

  return (
    <div className="absolute top-14 right-72 z-20 w-80 bg-slate-950/95 border border-slate-800/90 rounded-2xl shadow-2xl p-4 backdrop-blur-md select-none max-h-[85vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider text-slate-100">LIGHTING & ENVIRONMENT</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-200 text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="py-3 space-y-4">
        {/* Environment Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            ATMOSPHERE PRESET
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {presets.map((p) => {
              const isSelected = lighting.environmentPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`flex flex-col text-left p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 text-cyan-400 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xs font-medium">{p.name}</span>
                  <span className="text-[10px] text-slate-500">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[1px] bg-slate-800" />

        {/* 3-Point Light Rig Sliders */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Lamp className="w-3.5 h-3.5 text-cyan-400" />
            3-POINT STUDIO RIG
          </span>

          {/* Key Light */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-300">Key Light (Cast Shadows)</span>
              <span className="text-cyan-400">{lighting.keyLight.intensity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lighting.keyLight.color}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    keyLight: { ...lighting.keyLight, color: e.target.value },
                  })
                }
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={lighting.keyLight.intensity}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    keyLight: {
                      ...lighting.keyLight,
                      intensity: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-cyan-400"
              />
            </div>
          </div>

          {/* Fill Light */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-300">Fill Light</span>
              <span className="text-cyan-400">{lighting.fillLight.intensity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lighting.fillLight.color}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    fillLight: { ...lighting.fillLight, color: e.target.value },
                  })
                }
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={lighting.fillLight.intensity}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    fillLight: {
                      ...lighting.fillLight,
                      intensity: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-cyan-400"
              />
            </div>
          </div>

          {/* Rim Light */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-300">Rim / Backlight</span>
              <span className="text-purple-400">{lighting.rimLight.intensity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lighting.rimLight.color}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    rimLight: { ...lighting.rimLight, color: e.target.value },
                  })
                }
                className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="4"
                step="0.1"
                value={lighting.rimLight.intensity}
                onChange={(e) =>
                  onChange({
                    ...lighting,
                    rimLight: {
                      ...lighting.rimLight,
                      intensity: parseFloat(e.target.value),
                    },
                  })
                }
                className="flex-1 accent-purple-400"
              />
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-slate-800" />

        {/* Fog & Ground Grounding */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <CloudFog className="w-3.5 h-3.5 text-cyan-400" />
            GROUND & DEPTH FOG
          </span>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Horizon Fog Fade</span>
            <input
              type="checkbox"
              checked={lighting.fog.enabled}
              onChange={(e) =>
                onChange({
                  ...lighting,
                  fog: { ...lighting.fog, enabled: e.target.checked },
                })
              }
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Contact Ground Shadow</span>
            <input
              type="checkbox"
              checked={lighting.showFloor}
              onChange={(e) =>
                onChange({
                  ...lighting,
                  showFloor: e.target.checked,
                })
              }
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
