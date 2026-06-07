import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Zap, AlertTriangle, CheckCircle2, Info, ArrowDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LayoutThrashLab: React.FC = () => {
  const [mode, setMode] = useState<'none' | 'bad' | 'good'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [forcedReflows, setForcedReflows] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  
  const boxCount = 10;
  
  const runSimulation = () => {
    if (mode === 'none') return;
    setIsProcessing(true);
    setForcedReflows(0);
    setTimeTaken(0);

    // Simulate the time and reflows
    // In a real environment we can't easily count actual reflows from JS without DevTools
    // so we simulate the PEDAGOGICAL impact.
    
    let simulatedTime = 0;
    let simulatedReflows = 0;

    if (mode === 'bad') {
      // Each box triggers 2 forced reflows (read offsetHeight, read offsetWidth)
      simulatedReflows = boxCount * 2;
      simulatedTime = boxCount * 1.5; // ~1.5ms per box overhead
    } else {
      // All reads batched -> 1-2 reflows total
      simulatedReflows = 2;
      simulatedTime = 0.5 + (boxCount * 0.1); 
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 0.2;
      setTimeTaken(prev => Math.min(simulatedTime, prev + 0.2));
      setForcedReflows(prev => Math.min(simulatedReflows, Math.floor((current / simulatedTime) * simulatedReflows)));
      
      if (current >= simulatedTime) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 50);
  };

  useEffect(() => {
    if (mode !== 'none') {
      runSimulation();
    }
  }, [mode]);

  const badCode = `// ❌ Layout Thrashing
elements.forEach(el => {
  const h = el.offsetHeight; // forced reflow
  el.style.height = (h + 10) + 'px';
  const w = el.offsetWidth; // forced reflow
  el.style.width = (w + 10) + 'px';
});`;

  const goodCode = `// ✅ Batched (Optimized)
const rects = elements.map(el => ({
  h: el.offsetHeight,
  w: el.offsetWidth
}));

elements.forEach((el, i) => {
  el.style.height = (rects[i].h + 10) + 'px';
  el.style.width = (rects[i].w + 10) + 'px';
});`;

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-100 w-full max-w-6xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap size={20} />
            <h3 className="text-xl font-bold tracking-tight">Layout Thrash Detection Lab</h3>
          </div>
          <p className="text-xs text-zinc-500 font-mono">Observe the cost of forced synchronous layouts</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setMode('bad'); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              mode === 'bad' ? "bg-rose-500/20 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
            )}
          >
            Run "Bad" Code
          </button>
          <button 
            onClick={() => { setMode('good'); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              mode === 'good' ? "bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200"
            )}
          >
            Run "Optimized" Code
          </button>
          <button onClick={() => { setMode('none'); setForcedReflows(0); setTimeTaken(0); }} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
            <RotateCcw size={18}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Code Comparison */}
        <div className="space-y-4">
           <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Implementation</span>
                 {mode !== 'none' && (
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded", mode === 'bad' ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500")}>
                       {mode === 'bad' ? "INEFFICIENT" : "OPTIMIZED"}
                    </span>
                 )}
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                 <pre className={cn("transition-colors duration-500", mode === 'bad' ? "text-rose-300/80" : mode === 'good' ? "text-emerald-300/80" : "text-zinc-600")}>
                    {mode === 'bad' ? badCode : mode === 'good' ? goodCode : "// Select a mode to see code"}
                 </pre>
              </div>
           </div>

           <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-start gap-3">
              <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                 <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Reading properties like <code className="text-indigo-300">offsetHeight</code> after a style change forces the browser to recalculate the entire layout immediately. Doing this in a loop is called **Layout Thrashing**.
                 </p>
              </div>
           </div>
        </div>

        {/* Results & Visualization */}
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Forced Reflows</span>
                 <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-black font-mono", forcedReflows > 5 ? "text-rose-500" : mode === 'good' ? "text-emerald-500" : "text-zinc-500")}>
                       {forcedReflows}
                    </span>
                    <span className="text-xs text-zinc-600 font-bold uppercase">Events</span>
                 </div>
              </div>
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col gap-1">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Main Thread Time</span>
                 <div className="flex items-baseline gap-2">
                    <span className={cn("text-3xl font-black font-mono", timeTaken > 10 ? "text-rose-500" : mode === 'good' ? "text-emerald-500" : "text-zinc-500")}>
                       {timeTaken.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-600 font-bold uppercase">ms</span>
                 </div>
              </div>
           </div>

           <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-6 space-y-6 min-h-[250px]">
              <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Visual Simulation ({boxCount} Elements)</div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                 {[...Array(boxCount)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={mode === 'bad' ? {
                        scale: [1, 1.1, 1],
                        borderColor: ["#3f3f46", "#f43f5e", "#3f3f46"]
                     } : mode === 'good' ? {
                        scale: [1, 1.05, 1],
                        borderColor: ["#3f3f46", "#10b981", "#3f3f46"]
                     } : {}}
                     transition={{
                        duration: 0.5,
                        delay: mode === 'bad' ? i * 0.15 : 0,
                        repeat: isProcessing ? Infinity : 0
                     }}
                     className="w-12 h-12 rounded-lg border-2 border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-[10px] font-bold text-zinc-700"
                   >
                      {i + 1}
                   </motion.div>
                 ))}
              </div>

              <div className="pt-6">
                 <AnimatePresence mode="wait">
                    {isProcessing ? (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         className="flex items-center justify-center gap-3 py-2 px-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs font-bold"
                       >
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                          PROCESSSING PIPELINE...
                       </motion.div>
                    ) : mode !== 'none' ? (
                       <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-4 rounded-xl border flex items-start gap-4",
                          mode === 'bad' ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                        )}
                       >
                          {mode === 'bad' ? (
                             <>
                                <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                   <span className="text-sm font-bold text-rose-200 block">Jank Detected!</span>
                                   <p className="text-xs text-rose-400/80 leading-relaxed">
                                      The main thread was blocked {simulatedReflows} times. This implementation would drop frames during a complex animation or on mobile devices.
                                   </p>
                                </div>
                             </>
                          ) : (
                             <>
                                <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                                <div className="space-y-1">
                                   <span className="text-sm font-bold text-emerald-200 block">Smooth as Butter</span>
                                   <p className="text-xs text-emerald-400/80 leading-relaxed">
                                      By batching reads and writes, the browser only needs to perform layout once at the end of the frame. 60fps achieved.
                                   </p>
                                </div>
                             </>
                          )}
                       </motion.div>
                    ) : (
                       <div className="text-center text-xs text-zinc-600 italic">
                          Click a run button above to start the simulation
                       </div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
