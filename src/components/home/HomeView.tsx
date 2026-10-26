import React from 'react';
import {
  Box,
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  Download,
  Shield,
  Palette,
  Compass,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, SAMPLE_PROJECTS } from '../../lib/storage/projectStorage';
import { ProjectScene } from '../../types/project';

interface HomeViewProps {
  settings: AppSettings;
  onGoToTab: (tab: 'create' | 'studio' | 'projects' | 'settings') => void;
  onOpenSample: (project: ProjectScene) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  onGoToTab,
  onOpenSample,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800/80 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Ambient background glows */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ backgroundColor: settings.themeAccent }}
        />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 bg-purple-600" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Neural & Parametric 3D Creation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Create Production-Ready <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${settings.themeAccent}, #8b5cf6, #38bdf8)`,
              }}
            >
              Interactive 3D Assets
            </span>{' '}
            With AI.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            {settings.appName} is a complete full-stack 3D creation platform. Synthesize characters, vehicles, props, and multi-object environments into true Three.js geometry. Customize PBR shaders, manipulate transforms with real-time gizmos, and export standard binary <span className="text-cyan-400 font-mono">.GLB</span> files for game engines and 3D web applications.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onGoToTab('studio')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-cyan-950/50"
              style={{
                background: `linear-gradient(135deg, ${settings.themeAccent}, #38bdf8)`,
              }}
            >
              <Box className="w-4 h-4 stroke-[2.5]" />
              <span>Launch 3D Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onGoToTab('create')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-slate-200 text-xs sm:text-sm font-semibold hover:bg-slate-850 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Start AI Creation</span>
            </button>

            <button
              onClick={() => onGoToTab('projects')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <span>Explore Project Library</span>
            </button>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>100% Real Three.js Geometry</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Binary .GLB Export</span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>PBR Shaders & Canvas Textures</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured 3D Sample Assets Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              CURATED PROCEDURAL 3D ASSETS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any sample model to inspect its 3D hierarchy, materials, and lighting in the real-time studio.
            </p>
          </div>
          <button
            onClick={() => onGoToTab('projects')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All in Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_PROJECTS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onOpenSample(sample)}
              className="group flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-5 transition-all cursor-pointer backdrop-blur-sm shadow-md hover:shadow-cyan-950/30"
            >
              <div className="space-y-3">
                <div className="h-32 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 flex items-center justify-center relative overflow-hidden group-hover:border-cyan-500/30 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-xl group-hover:scale-110 transition-transform">
                    <Box className="w-7 h-7 stroke-[2]" />
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-cyan-400">
                    {sample.polyCount.toLocaleString()} Polys
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {sample.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sample.description}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {sample.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs mt-4">
                <span className="text-[11px] text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Open in 3D Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] font-mono text-slate-500">PBR Shaders</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            ENTERPRISE 3D AI WORKFLOWS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineered from the ground up for 3D technical artists, game developers, and spatial engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Structured Text-to-3D</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize 3D models with structured prompt decomposition: subjects, visual styles, proportion ratios, materials, and negative constraints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">AI Character Creator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Construct modular bipedal robots, cyborg operatives, and heavy mechas with customizable limb proportions and hardpoint attachments.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Multi-Object Scene Assembly</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate entire architectural environments with grounded platforms, light pillars, and horizon fog fade-off.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Physically Based Materials</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fine-tune metallic roughness, clearcoat reflections, transmission glass, and procedural canvas textures (carbon fiber, brushed metal, hex grids).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Interactive 3D Viewport</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full transform gizmos (Translate, Rotate, Scale), camera angle presets, turntable rotation, and collapsible bottom dock with zero viewport occlusion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Standard GLTF / GLB Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export real binary GLB files directly to disk for immediate import into Blender, Unreal Engine, Unity, Godot, or Three.js web apps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
