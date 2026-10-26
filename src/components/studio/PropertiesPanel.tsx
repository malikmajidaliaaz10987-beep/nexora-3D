import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Palette,
  Sparkles,
  Layers,
  Trash2,
  Box,
  Copy,
  Check,
} from 'lucide-react';
import { PBRMaterialData } from '../../types/project';
import { MATERIAL_PRESETS } from '../../lib/three/materials';

interface PropertiesPanelProps {
  selectedId: string | null;
  objectName?: string;
  onUpdateTransform: (transform: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
  }) => void;
  onUpdateMaterial: (material: Partial<PBRMaterialData>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedId,
  objectName = 'Selected Object',
  onUpdateTransform,
  onUpdateMaterial,
  onDeleteSelected,
  onDuplicateSelected,
}) => {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0.5);
  const [posZ, setPosZ] = useState(0);

  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [scaleZ, setScaleZ] = useState(1);

  const [color, setColor] = useState('#06b6d4');
  const [roughness, setRoughness] = useState(0.25);
  const [metalness, setMetalness] = useState(0.85);
  const [emissive, setEmissive] = useState('#000000');
  const [wireframe, setWireframe] = useState(false);
  const [proceduralTexture, setProceduralTexture] = useState<'none' | 'carbon_fiber' | 'brushed_metal' | 'hex_grid' | 'circuit' | 'marble' | 'hologram'>('none');

  if (!selectedId) {
    return (
      <div className="flex flex-col h-full bg-slate-950/95 border-l border-slate-800/80 w-72 select-none p-6 text-center text-slate-500 justify-center">
        <Sliders className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
        <p className="text-xs">No object selected.</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Click an object in the 3D viewport or hierarchy outliner to inspect properties.
        </p>
      </div>
    );
  }

  const handlePositionChange = (x: number, y: number, z: number) => {
    setPosX(x);
    setPosY(y);
    setPosZ(z);
    onUpdateTransform({ position: [x, y, z] });
  };

  const handleScaleChange = (x: number, y: number, z: number) => {
    setScaleX(x);
    setScaleY(y);
    setScaleZ(z);
    onUpdateTransform({ scale: [x, y, z] });
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onUpdateMaterial({ color: newColor });
  };

  const handleRoughnessChange = (val: number) => {
    setRoughness(val);
    onUpdateMaterial({ roughness: val });
  };

  const handleMetalnessChange = (val: number) => {
    setMetalness(val);
    onUpdateMaterial({ metalness: val });
  };

  const handleWireframeToggle = (checked: boolean) => {
    setWireframe(checked);
    onUpdateMaterial({ wireframe: checked });
  };

  const handleApplyPreset = (preset: typeof MATERIAL_PRESETS[0]) => {
    setColor(preset.data.color);
    setRoughness(preset.data.roughness);
    setMetalness(preset.data.metalness);
    if (preset.data.emissive) setEmissive(preset.data.emissive);
    if (preset.data.proceduralTexture) setProceduralTexture(preset.data.proceduralTexture);
    onUpdateMaterial(preset.data);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-l border-slate-800/80 w-72 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase truncate max-w-[140px]">
            {objectName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicateSelected}
            title="Duplicate"
            className="p-1 hover:text-cyan-400 rounded cursor-pointer text-slate-400"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDeleteSelected}
            title="Delete"
            className="p-1 hover:text-rose-400 rounded cursor-pointer text-slate-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-5">
        {/* Transform: Position */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            POSITION (XYZ)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-500">X</label>
              <input
                type="number"
                step="0.1"
                value={posX}
                onChange={(e) => handlePositionChange(parseFloat(e.target.value) || 0, posY, posZ)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500">Y</label>
              <input
                type="number"
                step="0.1"
                value={posY}
                onChange={(e) => handlePositionChange(posX, parseFloat(e.target.value) || 0, posZ)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500">Z</label>
              <input
                type="number"
                step="0.1"
                value={posZ}
                onChange={(e) => handlePositionChange(posX, posY, parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Transform: Scale */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
            SCALE (XYZ)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-500">SX</label>
              <input
                type="number"
                step="0.1"
                value={scaleX}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value) || 1, scaleY, scaleZ)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500">SY</label>
              <input
                type="number"
                step="0.1"
                value={scaleY}
                onChange={(e) => handleScaleChange(scaleX, parseFloat(e.target.value) || 1, scaleZ)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-500">SZ</label>
              <input
                type="number"
                step="0.1"
                value={scaleZ}
                onChange={(e) => handleScaleChange(scaleX, scaleY, parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-slate-800" />

        {/* Material & Shaders */}
        <div className="space-y-3">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            PBR MATERIAL SHADER
          </span>

          {/* Color Picker */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Surface Tint</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
              />
              <span className="text-[11px] font-mono text-slate-400 uppercase">{color}</span>
            </div>
          </div>

          {/* Roughness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Roughness</span>
              <span className="text-cyan-400">{roughness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(e) => handleRoughnessChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Metalness */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-slate-400">Metalness</span>
              <span className="text-cyan-400">{metalness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={metalness}
              onChange={(e) => handleMetalnessChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          {/* Procedural Texture */}
          <div className="space-y-1">
            <span className="text-xs text-slate-300">Procedural Surface Finish</span>
            <select
              value={proceduralTexture}
              onChange={(e) => {
                const val = e.target.value as any;
                setProceduralTexture(val);
                onUpdateMaterial({ proceduralTexture: val });
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
            >
              <option value="none">None (Smooth PBR)</option>
              <option value="carbon_fiber">Carbon Fiber Weave</option>
              <option value="brushed_metal">Brushed Anisotropic Metal</option>
              <option value="hex_grid">Hexagonal Tech Grid</option>
              <option value="circuit">Cyber Circuit Traces</option>
              <option value="hologram">Hologram Iridescent Scanlines</option>
              <option value="marble">Fluid Vein Marble</option>
            </select>
          </div>

          {/* Wireframe toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300">Wireframe Debug</span>
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => handleWireframeToggle(e.target.checked)}
              className="accent-cyan-400 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="h-[1px] bg-slate-800" />

        {/* Quick Material Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            PBR PRESET LIBRARY
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {MATERIAL_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-colors text-left cursor-pointer group"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0"
                  style={{ backgroundColor: preset.data.color }}
                />
                <span className="text-[11px] text-slate-300 truncate group-hover:text-cyan-300">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
