import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  ArrowRight,
  Ratio,
  Box,
  AlertCircle,
} from 'lucide-react';
import { addGenerationHistory } from '../../lib/storage/projectStorage';

interface ImageGeneratorViewProps {
  onUseAsReference?: (promptText: string) => void;
}

export const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({ onUseAsReference }) => {
  const [prompt, setPrompt] = useState('Cyberpunk mecha titan with glowing neon conduits, cinematic rim light, photorealistic hard-surface CAD render');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/concept-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate visual concept');
      }

      setResultImage(data.imageUrl);

      addGenerationHistory({
        type: 'concept_art',
        prompt,
        status: 'completed',
        resultSummary: `Visual concept reference generated (${aspectRatio})`,
        thumbnail: data.imageUrl,
      });
    } catch (err: any) {
      setError(err.message || 'Generation error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `nexora_concept_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold tracking-wider text-slate-100">AI VISUAL CONCEPT GENERATOR</h2>
          <span className="text-xs font-mono text-indigo-400 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
            2D CAD Reference Synthesizer
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Generate 2D visual concept art, texture moodboards, and CAD schematics to serve as reference imagery prior to 3D mesh modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prompt Input */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">Concept Art Prompt</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500/60 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-4 gap-2">
              {(['1:1', '16:9', '4:3', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`p-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                    aspectRatio === ratio
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-500 text-white font-bold text-xs hover:bg-indigo-400 transition-all cursor-pointer shadow-lg shadow-indigo-950"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Visual Reference...' : 'Generate 2D Reference Image'}</span>
          </button>
        </div>

        {/* Output Display */}
        <div className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold tracking-wider text-slate-200">GENERATED REFERENCE</span>
              <span className="text-[11px] font-mono text-indigo-400">
                {isGenerating ? 'RENDERING' : resultImage ? 'READY' : 'STANDBY'}
              </span>
            </div>

            {isGenerating && (
              <div className="space-y-3 py-16 text-center">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-200">Rendering visual blueprint...</p>
              </div>
            )}

            {!isGenerating && resultImage && (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                  <img
                    src={resultImage}
                    alt="Synthesized Concept"
                    className="w-full rounded-lg object-contain max-h-[260px] mx-auto shadow-md"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:text-white hover:border-indigo-500/50 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download PNG</span>
                  </button>

                  {onUseAsReference && (
                    <button
                      onClick={() => onUseAsReference(prompt)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Model in 3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isGenerating && !resultImage && (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-indigo-400" />
                <p className="text-xs">No reference image generated yet.</p>
                <p className="text-[11px] text-slate-600">
                  Enter a concept prompt and click Generate.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Clearly labeled: 2D concept imagery is for visual reference prior to 3D spatial reconstruction.
          </div>
        </div>
      </div>
    </div>
  );
};
