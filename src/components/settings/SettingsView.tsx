import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Palette,
  Shield,
  HelpCircle,
  ExternalLink,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Box,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { AppSettings, getAppSettings, saveAppSettings, getGenerationHistory } from '../../lib/storage/projectStorage';
import { ProviderStatus, GenerationHistoryItem, ProjectScene } from '../../types/project';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onOpenInStudio?: (project: ProjectScene) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenInStudio,
}) => {
  const [activeTab, setActiveTab] = useState<'branding' | 'providers' | 'history' | 'security'>('branding');
  const [appName, setAppName] = useState(settings.appName);
  const [themeAccent, setThemeAccent] = useState(settings.themeAccent);
  const [brandSubtext, setBrandSubtext] = useState(settings.customBrandSubtext);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [historyItems, setHistoryItems] = useState<GenerationHistoryItem[]>([]);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    // Fetch provider status from server
    fetch('/api/providers/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) setProviders(data.providers);
      })
      .catch(() => {});

    setHistoryItems(getGenerationHistory());
  }, []);

  const handleSaveBranding = () => {
    const updated = saveAppSettings({
      appName: appName.trim() || 'NEXORA 3D AI',
      themeAccent,
      customBrandSubtext: brandSubtext.trim() || 'Next-Gen 3D Engine',
    });
    onUpdateSettings(updated);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleResetDefaults = () => {
    setAppName('NEXORA 3D AI');
    setThemeAccent('#06b6d4');
    setBrandSubtext('Next-Gen Procedural & Neural 3D Engine');
    const updated = saveAppSettings({
      appName: 'NEXORA 3D AI',
      themeAccent: '#06b6d4',
      customBrandSubtext: 'Next-Gen Procedural & Neural 3D Engine',
    });
    onUpdateSettings(updated);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">PLATFORM SETTINGS & ENGINE STATUS</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Customize brand appearance, inspect connected AI generation providers, view generation audit logs, and configure security controls.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'branding'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Branding & Appearance</span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'providers'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>3D AI Providers ({providers.length || 5})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Generation History ({historyItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Cost & Architecture</span>
        </button>
      </div>

      {/* Tab 1: Branding */}
      {activeTab === 'branding' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-6 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">Brand Customization</h3>
            <p className="text-xs text-slate-400">
              Update the application name, tagline, and theme accent colors in real time.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Application Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Tagline / Subtext</label>
              <input
                type="text"
                value={brandSubtext}
                onChange={(e) => setBrandSubtext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-cyan-500/60 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Primary Theme Accent</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeAccent}
                  onChange={(e) => setThemeAccent(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300 uppercase">{themeAccent}</span>

                <div className="flex items-center gap-1.5 ml-4">
                  {['#06b6d4', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setThemeAccent(c)}
                      className="w-5 h-5 rounded-full border border-slate-700 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveBranding}
              className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg"
              style={{ background: themeAccent }}
            >
              {savedBanner ? 'Branding Saved!' : 'Apply & Save Branding'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Providers */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-100">Transparent Provider Architecture</p>
              <p className="text-slate-400 mt-0.5">
                NEXORA maintains an honest distinction between real 3D geometries, 2D concept images, and interactive real-time scenes. All server credentials stay protected in environment variables without exposing secrets to client bundles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {p.name}
                        {p.isConfigured ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{p.type}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        p.isConfigured
                          ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {p.statusText}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">{p.description}</p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {p.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Latency: {p.latencyMs ? `${p.latencyMs}ms` : 'N/A'}
                  </span>
                  <a
                    href={p.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline"
                  >
                    <span>Provider Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Generation History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold tracking-wider text-slate-100">AUDIT LOG & GENERATIONS</span>
            <span className="text-[11px] font-mono text-slate-400">{historyItems.length} Entries</span>
          </div>

          {historyItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-30 text-cyan-400" />
              <p className="text-xs">No generation history recorded yet.</p>
              <p className="text-[11px] text-slate-600">
                Created models and synthesized assets will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-200 font-medium truncate max-w-sm">
                        {item.prompt}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.resultSummary}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {item.projectSnapshot && onOpenInStudio && (
                      <button
                        onClick={() => onOpenInStudio(item.projectSnapshot!)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/60 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Load 3D
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security & Cost Controls */}
      {activeTab === 'security' && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-5 max-w-3xl">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security Architecture & Cost Control Guidelines
            </h3>
            <p className="text-xs text-slate-400">
              Complies with Section 11 of the system specifications: server credential isolation, payload sanitation, and billing safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Zero Client Secret Exposure
              </span>
              <p className="text-slate-400 text-[11px]">
                Gemini API tokens and optional 3D cloud keys are handled strictly within <code className="text-cyan-300">server.ts</code>. No authorization tokens exist in the client JavaScript bundle.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                Hardware WebGL Fallback
              </span>
              <p className="text-slate-400 text-[11px]">
                Built-in Nexora Parametric 3D Engine executes completely on client WebGL hardware, requiring zero server API calls for geometric primitive assemblies and animations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-amber-400" />
                Truthful 3D Labeling
              </span>
              <p className="text-slate-400 text-[11px]">
                2D concept references and planar textures are explicitly identified. The platform never misrepresents 2D raster art as true geometric 3D meshes.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Cost Containment
              </span>
              <p className="text-slate-400 text-[11px]">
                No recurring credit card charges or automatic tier upgrades. Gemini Flash 3.8 handles spatial reasoning at low latency and minimal token consumption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
