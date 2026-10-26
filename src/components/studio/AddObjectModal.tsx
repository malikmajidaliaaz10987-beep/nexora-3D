import React, { useRef } from 'react';
import {
  Box,
  Circle,
  Cylinder,
  Sparkles,
  Upload,
  Cpu,
  Shield,
  Radio,
  Gem,
  Disc,
} from 'lucide-react';
import { ThreePrimitiveType } from '../../types/project';

interface AddObjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPrimitive: (type: ThreePrimitiveType) => void;
  onAddComposite: (compositeType: string, name: string) => void;
  onImportFile: (file: File) => void;
}

export const AddObjectModal: React.FC<AddObjectModalProps> = ({
  isOpen,
  onClose,
  onAddPrimitive,
  onAddComposite,
  onImportFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const primitives: { type: ThreePrimitiveType; name: string; desc: string; icon: React.ReactNode }[] = [
    { type: 'cube', name: 'Box / Cube', desc: 'Standard 6-sided polygon mesh', icon: <Box className="w-5 h-5 text-cyan-400" /> },
    { type: 'sphere', name: 'UV Sphere', desc: 'Smooth geodesic sphere', icon: <Circle className="w-5 h-5 text-blue-400" /> },
    { type: 'cylinder', name: 'Cylinder', desc: 'Extruded radial column', icon: <Cylinder className="w-5 h-5 text-teal-400" /> },
    { type: 'cone', name: 'Cone', desc: 'Tapered conical apex', icon: <Sparkles className="w-5 h-5 text-amber-400" /> },
    { type: 'torus', name: 'Torus Ring', desc: 'Donut ring polygon', icon: <Disc className="w-5 h-5 text-purple-400" /> },
    { type: 'capsule', name: 'Capsule', desc: 'Pill / rounded cylinder', icon: <Shield className="w-5 h-5 text-indigo-400" /> },
    { type: 'dodecahedron', name: 'Dodecahedron', desc: '12-faced platonic solid', icon: <Gem className="w-5 h-5 text-pink-400" /> },
    { type: 'plane', name: 'Flat Plane', desc: '2D quad surface mesh', icon: <Box className="w-5 h-5 text-slate-400" /> },
  ];

  const composites: { type: string; name: string; parts: number; desc: string; icon: React.ReactNode }[] = [
    { type: 'combat_drone', name: 'AeroStrike Drone TX-9', parts: 9, desc: 'Quad ducted fan autonomous flyer with weapon pod', icon: <Radio className="w-5 h-5 text-cyan-400" /> },
    { type: 'cyber_mech', name: 'Apex Strider Titan', parts: 10, desc: 'Bipedal heavy chassis with dual energy blasters', icon: <Cpu className="w-5 h-5 text-purple-400" /> },
    { type: 'cyber_helmet', name: 'Quantum Visor Helm', parts: 8, desc: 'Hard-surface cranial armor with rebreather module', icon: <Shield className="w-5 h-5 text-amber-400" /> },
    { type: 'crystal_monolith', name: 'Resonant Monolith', parts: 7, desc: 'Floating alien prism with orbiting shards and pedestal', icon: <Gem className="w-5 h-5 text-emerald-400" /> },
    { type: 'scifi_pod', name: 'Orbital Escape Pod', parts: 8, desc: 'Aerodynamic capsule with panoramic canopy and fins', icon: <Box className="w-5 h-5 text-blue-400" /> },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider text-slate-100 flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" />
              ADD 3D OBJECT TO SCENE
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select geometric primitives, composite 3D assemblies, or import your own GLTF model.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-6">
          {/* Section 1: Composite 3D Assemblies */}
          <div>
            <span className="text-[11px] font-mono text-purple-400 font-semibold tracking-wider flex items-center gap-1.5 mb-2.5">
              <Cpu className="w-3.5 h-3.5" />
              NEXORA PROCEDURAL HERO ASSEMBLIES (3-10 PARTS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {composites.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => {
                    onAddComposite(comp.type, comp.name);
                    onClose();
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-purple-500/50 hover:bg-slate-850 transition-all text-left cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-purple-500/30">
                    {comp.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">
                        {comp.name}
                      </span>
                      <span className="text-[10px] font-mono px-1 rounded bg-purple-950 border border-purple-500/30 text-purple-400">
                        {comp.parts} Parts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{comp.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Geometric Primitives */}
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold tracking-wider flex items-center gap-1.5 mb-2.5">
              <Box className="w-3.5 h-3.5" />
              STANDARD THREE.JS PRIMITIVES
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {primitives.map((prim) => (
                <button
                  key={prim.type}
                  onClick={() => {
                    onAddPrimitive(prim.type);
                    onClose();
                  }}
                  className="flex flex-col items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-center cursor-pointer group"
                >
                  <div className="mb-2 p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40">
                    {prim.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                    {prim.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{prim.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Import GLB / GLTF */}
          <div>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold tracking-wider flex items-center gap-1.5 mb-2.5">
              <Upload className="w-3.5 h-3.5" />
              IMPORT CUSTOM 3D MODEL FILE
            </span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".glb,.gltf"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/40 hover:bg-slate-900 transition-colors text-xs text-slate-300 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Choose .GLB or .GLTF file from your computer (auto-scaled & grounded)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
