import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bug, Search, CheckCircle2, AlertCircle, XCircle, Database } from 'lucide-react';

interface LeakScenario {
  id: string;
  title: string;
  description: string;
  code: string;
  isLeak: boolean;
  type?: 'closure' | 'detached' | 'timer' | 'global';
  impact: number; // in MB
}

const SCENARIOS: LeakScenario[] = [
  {
    id: 's1',
    title: 'Safe Function',
    description: 'A standard function with local scope that gets cleared after execution.',
    code: `function processData(data) {\n  const result = data.map(x => x * 2);\n  return result;\n}`,
    isLeak: false,
    impact: 0
  },
  {
    id: 's2',
    title: 'Forgotten Timer',
    description: 'Starting an interval without saving the ID or clearing it on cleanup.',
    code: `function startPolling() {\n  setInterval(() => {\n    this.data = fetchData();\n  }, 1000);\n}`,
    isLeak: true,
    type: 'timer',
    impact: 2.8
  },
  {
    id: 's3',
    title: 'Closure Retention',
    description: 'A long-lived closure that references a large object from its parent scope.',
    code: `function createHandler() {\n  const hugeData = new Array(1000000);\n  return () => {\n    console.log("Clicked");\n  };\n}`,
    isLeak: true,
    type: 'closure',
    impact: 1.9
  },
  {
    id: 's4',
    title: 'Detached DOM',
    description: 'Keeping a reference to a DOM node after it has been removed from the document.',
    code: `let cachedBtn = document.getElementById('btn');\nfunction removeUI() {\n  document.body.innerHTML = "";\n}`,
    isLeak: true,
    type: 'detached',
    impact: 1.2
  }
];

export const MemoryLeakDebugger: React.FC = () => {
  const [heapSize, setHeapSize] = useState(3.2);
  const [scannedIds, setScannedIds] = useState<Set<string>>(new Set());
  const [leaksFound, setLeaksFound] = useState<string[]>([]);
  const [activeScenario, setActiveScenario] = useState<LeakScenario | null>(null);

  const scanScenario = (scenario: LeakScenario) => {
    if (scannedIds.has(scenario.id)) return;

    setActiveScenario(scenario);
    setScannedIds(prev => new Set([...prev, scenario.id]));

    if (scenario.isLeak) {
      setLeaksFound(prev => [...prev, scenario.id]);
      setHeapSize(prev => +(prev + scenario.impact).toFixed(1));
    }
  };

  const fixAll = () => {
    setHeapSize(3.2);
    setLeaksFound([]);
    setScannedIds(new Set());
    setActiveScenario(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heap Monitor */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Database size={16} className="text-indigo-500" />
                V8 Heap Monitor
              </h4>
              <span className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                Live Stats
              </span>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <div className="text-6xl font-mono font-bold text-zinc-100 tracking-tighter">
                {heapSize.toFixed(1)}
              </div>
              <div className="text-2xl font-mono font-bold text-zinc-500 pb-1">MB</div>
              <div className={`flex items-center gap-1 mb-2 px-2 py-0.5 rounded text-xs font-bold ${
                heapSize > 5 ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                <Activity size={12} />
                {heapSize > 3.2 ? `+${(heapSize - 3.2).toFixed(1)} MB` : "Stable"}
              </div>
            </div>

            {/* Simulated mini chart */}
            <div className="flex items-end gap-1 h-24 mb-4">
              {[...Array(20)].map((_, i) => {
                const height = i === 19 ? (heapSize / 15) * 100 : Math.random() * 20 + 20;
                return (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-t-sm ${i === 19 ? (heapSize > 5 ? "bg-red-500" : "bg-indigo-500") : "bg-zinc-800"}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5 }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Leaks Detected</div>
              <div className={`text-xl font-mono font-bold ${leaksFound.length > 0 ? "text-red-400" : "text-zinc-400"}`}>
                {leaksFound.length}
              </div>
            </div>
            <div className="flex-1 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Collection State</div>
              <div className="text-xl font-mono font-bold text-indigo-400">Orinoco</div>
            </div>
          </div>
        </div>

        {/* Scan Results */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <Search size={16} className="text-indigo-500" />
            Scanner Input
          </h4>

          <div className="space-y-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => scanScenario(s)}
                className={`w-full text-left p-4 rounded-xl border transition-all group ${
                  scannedIds.has(s.id)
                  ? (s.isLeak ? "bg-red-500/5 border-red-500/30" : "bg-emerald-500/5 border-emerald-500/30")
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      scannedIds.has(s.id)
                      ? (s.isLeak ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400")
                      : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {scannedIds.has(s.id) ? (s.isLeak ? <Bug size={18} /> : <CheckCircle2 size={18} />) : <Search size={18} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-200">{s.title}</div>
                      <div className="text-xs text-zinc-500">{s.description}</div>
                    </div>
                  </div>
                  {scannedIds.has(s.id) && (
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${s.isLeak ? "text-red-400" : "text-emerald-400"}`}>
                      {s.isLeak ? "Leak Found" : "Safe"}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={fixAll}
            className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Activity size={18} /> Run Garbage Collector
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activeScenario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${activeScenario.isLeak ? "bg-red-500" : "bg-emerald-500"}`} />
                <span className="text-sm font-bold text-zinc-300">Code Analysis: {activeScenario.title}</span>
              </div>
              {activeScenario.type && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono uppercase tracking-widest border border-zinc-700">
                  Type: {activeScenario.type}
                </span>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 font-mono text-xs leading-relaxed text-indigo-300 overflow-x-auto">
                  <pre>{activeScenario.code}</pre>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                  <div className={`mt-1 ${activeScenario.isLeak ? "text-red-400" : "text-emerald-400"}`}>
                    {activeScenario.isLeak ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-200 mb-1">
                      {activeScenario.isLeak ? "Leak Identified" : "Memory Management: OK"}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic">
                      {activeScenario.isLeak 
                        ? `This pattern will cause the heap to grow by ~${activeScenario.impact}MB per occurrence. The GC cannot reclaim this memory because it remains reachable through the ${activeScenario.type} path.`
                        : "The V8 engine can successfully garbage collect all objects created within this scope once the function finishes execution."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
