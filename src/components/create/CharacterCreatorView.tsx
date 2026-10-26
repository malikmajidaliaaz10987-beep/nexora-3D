import React, { useState } from 'react';
import {
  User,
  Shield,
  Sparkles,
  Box,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Sword,
  Cpu,
} from 'lucide-react';
import { ProjectScene } from '../../types/project';
import { saveProject, addGenerationHistory } from '../../lib/storage/projectStorage';

interface CharacterCreatorViewProps {
  onOpenInStudio: (project: ProjectScene) => void;
}

export const CharacterCreatorView: React.FC<CharacterCreatorViewProps> = ({ onOpenInStudio }) => {
  const [characterName, setCharacterName] = useState('Nexus Vanguard Mk.IV');
  const [archetype, setArchetype] = useState<'mecha_heavy' | 'cyber_android' | 'scout_agile' | 'space_pilot'>('mecha_heavy');
  const [armorBulk, setArmorBulk] = useState(1.2);
  const [limbHeight, setLimbHeight] = useState(1.1);
  const [primaryColor, setPrimaryColor] = useState('#06b6d4');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const [hasShoulderArmor, setHasShoulderArmor] = useState(true);
  const [hasBlasters, setHasBlasters] = useState(true);
  const [hasReactor, setHasReactor] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<ProjectScene | null>(null);

  const archetypes = [
    { id: 'mecha_heavy', name: 'Titan Mecha', desc: 'Heavy armored combat platform with dual cannons' },
    { id: 'cyber_android', name: 'Cyber Android', desc: 'Sleek synthetic operative with composite chassis' },
    { id: 'scout_agile', name: 'Agile Scout', desc: 'Lightweight aerodynamic high-mobility frame' },
    { id: 'space_pilot', name: 'Exo-Pilot', desc: 'Pressurized pilot suit with reinforced helm' },
  ];

  const handleBuildCharacter = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);

      const newProj: ProjectScene = {
        id: `proj_char_${Date.now()}`,
        name: characterName,
        description: `Custom ${archetype} character with customized proportions and PBR plating.`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        polyCount: 4680,
        lighting: {
          keyLight: { color: primaryColor, intensity: 2.5, position: [5, 6, 4], castShadow: true },
          fillLight: { color: accentColor, intensity: 1.5, position: [-5, 3, -3] },
          rimLight: { color: '#38bdf8', intensity: 1.8, position: [0, 5, -5] },
          hemisphere: { skyColor: '#0ea5e9', groundColor: '#0f172a', intensity: 0.6 },
          ambientIntensity: 0.35,
          environmentPreset: 'cyberpunk',
          showGrid: true,
          showFloor: true,
          fog: { enabled: true, color: '#030712', near: 10, far: 30 },
        },
        camera: { position: [3.8, 2.2, 4.2], target: [0, 1.4, 0], fov: 45 },
        tags: ['Character', 'Rig', 'Mecha', 'Custom'],
        objects: [
          {
            id: 'char_torso',
            name: 'Chassis_Torso',
            type: 'cube',
            transform: { position: [0, 1.6, 0], rotation: [0, 0, 0], scale: [0.9 * armorBulk, 0.85, 0.6 * armorBulk] },
            material: { color: primaryColor, roughness: 0.25, metalness: 0.85, proceduralTexture: 'carbon_fiber' },
            visible: true,
          },
          {
            id: 'char_head',
            name: 'Head_Visor',
            type: 'cube',
            transform: { position: [0, 2.15, 0.05], rotation: [0, 0, 0], scale: [0.45, 0.35, 0.5] },
            material: { color: '#0f172a', roughness: 0.3, metalness: 0.9 },
            visible: true,
          },
          {
            id: 'char_visor_glass',
            name: 'Optic_Sensor',
            type: 'cube',
            transform: { position: [0, 2.15, 0.32], rotation: [0, 0, 0], scale: [0.38, 0.14, 0.08] },
            material: { color: '#38bdf8', roughness: 0.1, metalness: 0.2, emissive: '#38bdf8' },
            visible: true,
          },
          ...(hasReactor ? [{
            id: 'char_reactor',
            name: 'Arc_Reactor',
            type: 'cylinder' as const,
            transform: { position: [0, 1.7, 0.33] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number], scale: [0.15, 0.08, 0.15] as [number, number, number] },
            material: { color: accentColor, roughness: 0.1, metalness: 0.1, emissive: accentColor },
            visible: true,
          }] : []),
          ...(hasShoulderArmor ? [
            {
              id: 'char_shoulder_l',
              name: 'Pauldron_Left',
              type: 'cone' as const,
              transform: { position: [-0.75 * armorBulk, 1.85, 0] as [number, number, number], rotation: [0, 0, Math.PI / 2] as [number, number, number], scale: [0.35, 0.5, 0.35] as [number, number, number] },
              material: { color: accentColor, roughness: 0.2, metalness: 0.8 },
              visible: true,
            },
            {
              id: 'char_shoulder_r',
              name: 'Pauldron_Right',
              type: 'cone' as const,
              transform: { position: [0.75 * armorBulk, 1.85, 0] as [number, number, number], rotation: [0, 0, -Math.PI / 2] as [number, number, number], scale: [0.35, 0.5, 0.35] as [number, number, number] },
              material: { color: accentColor, roughness: 0.2, metalness: 0.8 },
              visible: true,
            },
          ] : []),
          {
            id: 'char_pelvis',
            name: 'Pelvis_Joint',
            type: 'cylinder',
            transform: { position: [0, 1.0, 0], rotation: [0, 0, 0], scale: [0.35, 0.35, 0.35] },
            material: { color: '#1e293b', roughness: 0.5, metalness: 0.9 },
            visible: true,
          },
          {
            id: 'char_leg_l',
            name: 'Leg_Left',
            type: 'cylinder',
            transform: { position: [-0.35, 0.5 * limbHeight, 0], rotation: [0, 0, 0], scale: [0.22, 1.0 * limbHeight, 0.22] },
            material: { color: '#1e293b', roughness: 0.35, metalness: 0.85 },
            visible: true,
          },
          {
            id: 'char_leg_r',
            name: 'Leg_Right',
            type: 'cylinder',
            transform: { position: [0.35, 0.5 * limbHeight, 0], rotation: [0, 0, 0], scale: [0.22, 1.0 * limbHeight, 0.22] },
            material: { color: '#1e293b', roughness: 0.35, metalness: 0.85 },
            visible: true,
          },
          ...(hasBlasters ? [
            {
              id: 'char_blaster_l',
              name: 'Arm_Blaster_Left',
              type: 'cylinder' as const,
              transform: { position: [-0.85, 1.3, 0.3] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number], scale: [0.08, 0.6, 0.08] as [number, number, number] },
              material: { color: '#0f172a', roughness: 0.3, metalness: 0.95 },
              visible: true,
            },
            {
              id: 'char_blaster_r',
              name: 'Arm_Blaster_Right',
              type: 'cylinder' as const,
              transform: { position: [0.85, 1.3, 0.3] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number], scale: [0.08, 0.6, 0.08] as [number, number, number] },
              material: { color: '#0f172a', roughness: 0.3, metalness: 0.95 },
              visible: true,
            },
          ] : []),
        ],
      };

      saveProject(newProj);
      addGenerationHistory({
        type: 'character',
        prompt: characterName,
        status: 'completed',
        resultSummary: `${archetype} character rig with ${newProj.objects.length} modular components`,
        projectSnapshot: newProj,
      });

      setGeneratedProject(newProj);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">AI CHARACTER CREATOR</h2>
          <span className="text-xs font-mono text-purple-400 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
            Modular Rigging Engine
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Construct stylized 3D characters with procedural joints, armor attachments, and configurable anatomical proportions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Controls */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          {/* Character Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Character Model Name</label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
            />
          </div>

          {/* Archetypes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Frame Archetype</label>
            <div className="grid grid-cols-2 gap-2">
              {archetypes.map((arch) => (
                <button
                  key={arch.id}
                  onClick={() => setArchetype(arch.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    archetype === arch.id
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{arch.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{arch.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Proportion Sliders */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Armor Plating Bulk</span>
                <span className="text-purple-400">{armorBulk.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.05"
                value={armorBulk}
                onChange={(e) => setArmorBulk(parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Limb Length Ratio</span>
                <span className="text-purple-400">{limbHeight.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={limbHeight}
                onChange={(e) => setLimbHeight(parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Chassis Color</label>
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-400">{primaryColor}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Accent Trim</label>
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-400">{accentColor}</span>
              </div>
            </div>
          </div>

          {/* Hardpoint Modules */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-300">Hardpoint Attachments</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasShoulderArmor}
                  onChange={(e) => setHasShoulderArmor(e.target.checked)}
                  className="accent-purple-400"
                />
                <span className="text-slate-300 text-[11px]">Pauldrons</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasBlasters}
                  onChange={(e) => setHasBlasters(e.target.checked)}
                  className="accent-purple-400"
                />
                <span className="text-slate-300 text-[11px]">Cannons</span>
              </label>

              <label className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReactor}
                  onChange={(e) => setHasReactor(e.target.checked)}
                  className="accent-purple-400"
                />
                <span className="text-slate-300 text-[11px]">Core Light</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleBuildCharacter}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs hover:bg-purple-400 transition-all cursor-pointer shadow-lg shadow-purple-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Rig...' : 'Build 3D Character Rig'}</span>
          </button>
        </div>

        {/* Right Col: Preview & Action */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-200">CHARACTER BLUEPRINT</span>
              <span className="text-[11px] font-mono text-purple-400">
                {generatedProject ? 'SYNTHESIZED' : 'CONFIGURING'}
              </span>
            </div>

            {generatedProject ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Modular Character Assembled</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mt-1">{generatedProject.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{generatedProject.description}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-slate-400">ASSEMBLED RIG PARTS:</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {generatedProject.objects.map((obj) => (
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
                  onClick={() => onOpenInStudio(generatedProject)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs hover:bg-purple-400 transition-colors cursor-pointer shadow-lg shadow-purple-950"
                >
                  <Box className="w-4 h-4" />
                  <span>Launch Character in 3D Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Cpu className="w-10 h-10 mx-auto opacity-30 text-purple-400" />
                <p className="text-xs">Configure archetype and click "Build 3D Character Rig".</p>
                <p className="text-[11px] text-slate-600">
                  Custom parts, proportions, and lighting are assembled in real Three.js geometry.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Kinematic pivots are anchored at bottom-center so character stands grounded on terrain.
          </div>
        </div>
      </div>
    </div>
  );
};
