import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Zap, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PipelineStage {
  id: number;
  stage: string;
  description: string;
  mainThread: string[];
  durationMs: number;
  explanation: string;
  isForced?: boolean;
}

interface Scenario {
  id: string;
  scenario_title: string;
  code: string;
  stages: PipelineStage[];
  totalDurationMs: number;
  frameBudgetUtilization: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "pixel-pipeline-normal",
    scenario_title: "Normal Execution (Optimized)",
    code: "// Setting property\nel.style.width = '200px';",
    stages: [
      {
        id: 1,
        stage: "JavaScript",
        description: "JS code runs. Browser marks layout as 'dirty'.",
        mainThread: ["JS: el.style.width = '200px'"],
        durationMs: 0.5,
        explanation: "JavaScript executes on main thread. Changing style.width is just a write to a JS object. Browser doesn't layout immediately."
      },
      {
        id: 2,
        stage: "Style",
        description: "Browser recalculates styles.",
        mainThread: ["Style Recalculation: ~0.3ms"],
        durationMs: 0.3,
        explanation: "Browser matches CSS rules and resolves custom properties. This happens before the next paint."
      },
      {
        id: 3,
        stage: "Layout",
        description: "Browser calculates geometry (Reflow).",
        mainThread: ["Layout: ~2ms"],
        durationMs: 2.0,
        explanation: "The most expensive stage. Browser calculates exact positions and sizes. Changing width triggers this for the whole tree."
      },
      {
        id: 4,
        stage: "Paint",
        description: "Browser rasterizes elements into bitmaps.",
        mainThread: ["Paint: ~1ms"],
        durationMs: 1.0,
        explanation: "Paint creates a display list of drawing commands. If on a separate layer, only that layer is repainted."
      },
      {
        id: 5,
        stage: "Composite",
        description: "Compositor thread sends layers to GPU.",
        mainThread: ["(Compositor Thread)"],
        durationMs: 0.2,
        explanation: "Final stage. Layers are combined and displayed. This stage can run even if main thread is busy."
      }
    ],
    totalDurationMs: 4.0,
    frameBudgetUtilization: "25% (60fps guaranteed)"
  },
  {
    id: "pixel-pipeline-thrashing",
    scenario_title: "Layout Thrashing (Forced Reflow)",
    code: "// Interleaved Read/Write\nel.style.width = '200px';\nconst h = el.offsetHeight; // ❌ Forced!\nel.style.height = h + 'px';",
    stages: [
      {
        id: 1,
        stage: "JavaScript (Write)",
        description: "width = '200px'. Layout marked dirty.",
        mainThread: ["JS: width = '200px'"],
        durationMs: 0.1,
        explanation: "Simple property assignment. No immediate layout yet."
      },
      {
        id: 2,
        stage: "⚠️ FORCED LAYOUT",
        description: "offsetHeight READ. Browser must reflow now.",
        mainThread: ["JS: offsetHeight -> [FORCED Style + Layout]"],
        durationMs: 2.5,
        explanation: "CRITICAL: Browser stops JS to calculate geometry because you asked for a 'live' property. This is synchronous and blocking.",
        isForced: true
      },
      {
        id: 3,
        stage: "JavaScript (Write 2)",
        description: "height = h + 'px'. Layout dirty again.",
        mainThread: ["JS: height = ..."],
        durationMs: 0.1,
        explanation: "Another write. Layout is dirty again even though we just calculated it!"
      },
      {
        id: 4,
        stage: "Style",
        description: "End of JS block style recalculation.",
        mainThread: ["Style Recalculation"],
        durationMs: 0.3,
        explanation: "Normal recalculation of styles for the second write."
      },
      {
        id: 5,
        stage: "Layout",
        description: "Final Layout (3rd time this frame!).",
        mainThread: ["Layout (3rd time)"],
        durationMs: 2.0,
        explanation: "Layout runs again because of the second write. Total time spent on layout tripled."
      },
      {
        id: 6,
        stage: "Paint + Composite",
        description: "Final rasterization and display.",
        mainThread: ["Paint -> Composite"],
        durationMs: 1.5,
        explanation: "Total frame time is significantly higher, risking dropped frames (jank)."
      }
    ],
    totalDurationMs: 6.5,
    frameBudgetUtilization: "41% (3x overhead)"
  }
];

export const PixelPipelineSimulator: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario = SCENARIOS[activeScenarioIdx];
  const step = scenario.stages[currentStep];

  const next = () => setCurrentStep(s => Math.min(s + 1, scenario.stages.length - 1));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-100 w-full max-w-6xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Clock size={20} />
            <h3 className="text-xl font-bold tracking-tight">Pixel Pipeline Simulator</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => switchScenario(idx)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeScenarioIdx === idx 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                )}
              >
                {s.scenario_title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800 self-end md:self-auto">
          <button onClick={reset} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors" title="Reset"><RotateCcw size={18}/></button>
          <div className="w-[1px] h-6 bg-zinc-800 mx-1" />
          <button onClick={prev} disabled={currentStep === 0} className="p-2 hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs font-mono w-16 text-center text-zinc-500">
            {currentStep + 1} / {scenario.stages.length}
          </span>
          <button onClick={next} disabled={currentStep === scenario.stages.length - 1} className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 rounded-lg text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Code & State */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 font-mono text-sm relative overflow-hidden">
             <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em] mb-4">Executed JS</div>
             <div className="text-indigo-400 leading-relaxed whitespace-pre">
                {scenario.code}
             </div>
             {step.isForced && (
               <div className="absolute top-4 right-6 animate-pulse flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded text-[10px] font-bold">
                 <AlertTriangle size={12} /> FORCED SYNC LAYOUT
               </div>
             )}
          </div>

          {/* Timeline Visualizer */}
          <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 space-y-8">
             <div className="flex justify-between items-center">
                <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Frame Timeline (16.6ms budget)</div>
                <div className="flex items-center gap-4 text-[10px] font-bold">
                   <span className="text-zinc-500">Total: <span className="text-zinc-300 font-mono">{scenario.totalDurationMs}ms</span></span>
                   <span className={cn(activeScenarioIdx === 0 ? "text-emerald-500" : "text-amber-500")}>
                     {scenario.frameBudgetUtilization}
                   </span>
                </div>
             </div>

             <div className="relative h-12 bg-zinc-900 rounded-xl overflow-hidden flex shadow-inner">
                {/* 16ms grid markings */}
                <div className="absolute inset-0 flex pointer-events-none">
                   {[...Array(4)].map((_, i) => (
                     <div key={i} className="h-full border-l border-zinc-800/30 flex-1" />
                   ))}
                </div>

                <AnimatePresence mode="popLayout">
                  {scenario.stages.slice(0, currentStep + 1).map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: `${(s.durationMs / 16.6) * 100}%`, opacity: 1 }}
                      className={cn(
                        "h-full relative group cursor-help transition-colors",
                        s.stage.includes("JS") ? "bg-indigo-500/60" :
                        s.stage === "Style" ? "bg-purple-500/60" :
                        s.stage === "Layout" ? "bg-amber-500/60" :
                        s.stage === "Paint" ? "bg-rose-500/60" :
                        s.stage === "Composite" ? "bg-emerald-500/60" :
                        s.isForced ? "bg-rose-600" : "bg-zinc-700/60"
                      )}
                    >
                       <div className="absolute inset-0 border-r border-zinc-950/20" />
                    </motion.div>
                  ))}
                </AnimatePresence>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {["JavaScript", "Style", "Layout", "Paint", "Composite"].map(name => (
                  <div key={name} className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      name === "JavaScript" ? "bg-indigo-500" :
                      name === "Style" ? "bg-purple-500" :
                      name === "Layout" ? "bg-amber-500" :
                      name === "Paint" ? "bg-rose-500" :
                      "bg-emerald-500"
                    )} />
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">{name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right: Stage Detail */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 text-emerald-400 mb-6">
              <Zap size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Active Stage: {step.stage}</span>
            </div>
            
            <h4 className="text-lg font-bold text-zinc-100 mb-2">{step.description}</h4>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
               <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Main Thread Activities</div>
               <div className="space-y-1.5">
                  {step.mainThread.map((activity, i) => (
                    <div key={i} className="text-xs font-mono text-zinc-400 flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                       {activity}
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
               <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                 <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Senior Insight</h5>
                 <p className="text-xs text-zinc-400 italic leading-relaxed">
                   {step.explanation}
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
