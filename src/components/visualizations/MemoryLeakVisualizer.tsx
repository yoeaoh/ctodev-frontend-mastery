import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Link, Link2Off, Database, Cpu, AlertTriangle, CheckCircle2, Play, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeapObject {
  id: string;
  label: string;
  type: 'DOM' | 'Closure' | 'Global' | 'Array';
  size: number;
  isDetached?: boolean;
  isLeaking?: boolean;
}

interface Reference {
  from: string;
  to: string;
  label?: string;
}

export const MemoryLeakVisualizer: React.FC = () => {
  const [heap, setHeap] = useState<HeapObject[]>([
    { id: 'window', label: 'Window (GC Root)', type: 'Global', size: 100 },
    { id: 'dom-root', label: 'document.body', type: 'DOM', size: 50 },
    { id: 'leaky-btn', label: 'button#action', type: 'DOM', size: 20 },
    { id: 'handler', label: 'onClick Handler', type: 'Closure', size: 10 },
  ]);

  const [references, setReferences] = useState<Reference[]>([
    { from: 'window', to: 'dom-root' },
    { from: 'dom-root', to: 'leaky-btn' },
    { from: 'leaky-btn', to: 'handler', label: 'listener' },
  ]);

  const [step, setStep] = useState(0);
  const [isFixed, setIsFixed] = useState(false);

  const totalMemory = heap.reduce((acc, obj) => acc + obj.size, 0);
  const leakingNodes = heap.filter(obj => obj.isLeaking).length;

  const runScenario = () => {
    if (step === 0) {
      // Step 1: Remove button from DOM
      setHeap(prev => prev.map(obj => 
        obj.id === 'leaky-btn' ? { ...obj, isDetached: true, isLeaking: true } : obj
      ));
      setReferences(prev => prev.filter(ref => ref.from !== 'dom-root' || ref.to !== 'leaky-btn'));
      setStep(1);
    }
  };

  const fixLeak = () => {
    if (step === 1) {
      // Step 2: Nullify reference to handler
      setReferences(prev => prev.filter(ref => ref.from !== 'leaky-btn' || ref.to !== 'handler'));
      setIsFixed(true);
      
      // Simulate GC
      setTimeout(() => {
        setHeap(prev => prev.filter(obj => obj.id !== 'leaky-btn' && obj.id !== 'handler'));
        setStep(2);
      }, 1000);
    }
  };

  const reset = () => {
    setHeap([
      { id: 'window', label: 'Window (GC Root)', type: 'Global', size: 100 },
      { id: 'dom-root', label: 'document.body', type: 'DOM', size: 50 },
      { id: 'leaky-btn', label: 'button#action', type: 'DOM', size: 20 },
      { id: 'handler', label: 'onClick Handler', type: 'Closure', size: 10 },
    ]);
    setReferences([
      { from: 'window', to: 'dom-root' },
      { from: 'dom-root', to: 'leaky-btn' },
      { from: 'leaky-btn', to: 'handler', label: 'listener' },
    ]);
    setStep(0);
    setIsFixed(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-100 w-full max-w-6xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400">
            <Cpu size={20} />
            <h3 className="text-xl font-bold tracking-tight">V8 Memory Leak Debugger</h3>
          </div>
          <p className="text-xs text-zinc-500 font-mono">Simulating Detached DOM Node Leaks</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Heap Usage</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(totalMemory / 200) * 100}%` }}
                    className={cn("h-full transition-colors", totalMemory > 150 ? "bg-rose-500" : "bg-indigo-500")}
                  />
                </div>
                <span className="text-xs font-mono text-zinc-400">{totalMemory} KB</span>
              </div>
           </div>
           <button onClick={reset} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"><RotateCcw size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Heap Visualization */}
        <div className="lg:col-span-2 bg-zinc-950 rounded-2xl border border-zinc-800 p-8 relative overflow-hidden min-h-[450px]">
          <div className="absolute top-4 left-6 text-[10px] font-bold text-zinc-700 uppercase tracking-widest flex items-center gap-2">
            <Database size={12} />
            V8 Heap (Objects & References)
          </div>

          <div className="relative w-full h-full mt-8 flex flex-wrap gap-8 justify-center items-center">
             <AnimatePresence>
               {heap.map((obj) => (
                 <motion.div
                   key={obj.id}
                   layout
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ 
                     scale: 1, 
                     opacity: 1,
                     borderColor: obj.isLeaking ? 'rgba(244, 63, 94, 0.5)' : 'rgba(39, 39, 42, 1)',
                     backgroundColor: obj.isLeaking ? 'rgba(244, 63, 94, 0.05)' : 'rgba(24, 24, 27, 0.5)'
                   }}
                   exit={{ scale: 0.5, opacity: 0 }}
                   className={cn(
                     "w-36 h-36 rounded-2xl border-2 flex flex-col items-center justify-center p-4 text-center relative group transition-colors",
                     obj.type === 'Global' ? "border-amber-500/50 bg-amber-500/5" : "border-zinc-800"
                   )}
                 >
                    {obj.type === 'DOM' && <Layers size={24} className={cn("mb-2", obj.isDetached ? "text-rose-400" : "text-indigo-400")} />}
                    {obj.type === 'Global' && <Globe size={24} className="mb-2 text-amber-400" />}
                    {obj.type === 'Closure' && <Link size={24} className="mb-2 text-emerald-400" />}
                    
                    <span className="text-[11px] font-bold text-zinc-200 mb-1">{obj.label}</span>
                    <span className="text-[9px] font-mono text-zinc-500">{obj.size} KB</span>

                    {obj.isDetached && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg">
                        DETACHED
                      </div>
                    )}

                    {/* Reference Lines - Simplified with SVG overlays or absolute spans */}
                    {references.filter(ref => ref.from === obj.id).map(ref => {
                      const toObj = heap.find(o => o.id === ref.to);
                      if (!toObj) return null;
                      return (
                        <div key={`${ref.from}-${ref.to}`} className="absolute pointer-events-none">
                           {/* In a real production component we would use a library for SVG paths or calculate coordinates */}
                        </div>
                      );
                    })}
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>

          {/* SVG Overlay for references */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full">
             <defs>
               <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                 <polygon points="0 0, 10 3.5, 0 7" fill="rgba(63, 63, 70, 0.5)" />
               </marker>
             </defs>
             {/* We manually draw lines between expected positions for this demo */}
             {step === 0 && <line x1="50%" y1="20%" x2="50%" y2="40%" stroke="rgba(63, 63, 70, 0.5)" strokeWidth="2" />}
             {step === 0 && <line x1="50%" y1="40%" x2="50%" y2="60%" stroke="rgba(63, 63, 70, 0.5)" strokeWidth="2" />}
             {(step === 1 || step === 0) && <path d="M 50% 60% Q 65% 70% 50% 80%" fill="none" stroke={isFixed ? "rgba(63, 63, 70, 0.2)" : "rgba(244, 63, 94, 0.4)"} strokeWidth="2" strokeDasharray={isFixed ? "4" : "0"} />}
          </svg>
        </div>

        {/* Right: Controls & Info */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Scenario Controller</span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-zinc-100">Step {step + 1}: {
                  step === 0 ? "The Setup" : 
                  step === 1 ? "The Leak" : "The Recovery"
                }</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {step === 0 && "A button is added to the DOM with a heavy event listener attached. Everything is normal."}
                  {step === 1 && "The button is removed from the DOM, but the handler (closure) still has a reference to it. V8 cannot GC the node."}
                  {step === 2 && "The reference was nullified (or listener removed). V8's Mark-and-Sweep algorithm successfully reclaimed the memory."}
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={runScenario}
                  disabled={step !== 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                    step === 0 ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  <Trash2 size={16} />
                  Remove from DOM
                </button>

                <button 
                  onClick={fixLeak}
                  disabled={step !== 1 || isFixed}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all",
                    step === 1 && !isFixed ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20" : "bg-zinc-800 text-zinc-500"
                  )}
                >
                  <Link2Off size={16} />
                  Nullify References
                </button>
              </div>

              {step === 1 && !isFixed && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3">
                   <AlertTriangle className="text-rose-500 shrink-0" size={18} />
                   <div className="space-y-1">
                      <span className="block text-xs font-bold text-rose-200 uppercase tracking-tight">Leak Detected</span>
                      <span className="text-[10px] text-rose-400/80 leading-snug block">
                        The "button#action" node is detached but still alive in memory because it's referenced by a closure.
                      </span>
                   </div>
                </div>
              )}

              {step === 2 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3">
                   <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                   <div className="space-y-1">
                      <span className="block text-xs font-bold text-emerald-200 uppercase tracking-tight">Memory Reclaimed</span>
                      <span className="text-[10px] text-emerald-400/80 leading-snug block">
                        Garbage Collector cleaned up the unreachable objects. Heap is back to normal.
                      </span>
                   </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
               <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] text-zinc-500 italic">
                 "Senior Tip: Always remove event listeners when a component unmounts, or use 'once: true' for one-off actions."
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Globe: React.FC<{ size?: number, className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
