import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Play, Pause, SkipForward, Zap, Clock, AlertCircle } from 'lucide-react';

interface FiberNode {
  id: string;
  type: string;
  child?: string;
  sibling?: string;
  return?: string;
  depth: number;
  index: number;
}

const FIBER_TREE: Record<string, FiberNode> = {
  'root': { id: 'root', type: 'HostRoot', child: 'app', depth: 0, index: 0 },
  'app': { id: 'app', type: 'App', child: 'nav', return: 'root', depth: 1, index: 0 },
  'nav': { id: 'nav', type: 'nav', sibling: 'main', return: 'app', depth: 2, index: 0 },
  'main': { id: 'main', type: 'main', child: 'list', return: 'app', depth: 2, index: 1 },
  'list': { id: 'list', type: 'ul', child: 'item1', return: 'main', depth: 3, index: 0 },
  'item1': { id: 'item1', type: 'li', sibling: 'item2', return: 'list', depth: 4, index: 0 },
  'item2': { id: 'item2', type: 'li', return: 'list', depth: 4, index: 1 },
};

const FIBER_ORDER = ['root', 'app', 'nav', 'main', 'list', 'item1', 'item2'];

export const FiberTreeWalkthrough: React.FC = () => {
  const [currentFiberId, setCurrentFiberId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [workBudget, setWorkBudget] = useState(100); // % of frame
  const [isInterrupted, setIsInterrupted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const processNext = () => {
    setCurrentFiberId(prev => {
      if (!prev) return 'root';
      const idx = FIBER_ORDER.indexOf(prev);
      if (idx === FIBER_ORDER.length - 1) {
        setIsPaused(true);
        return null;
      }
      return FIBER_ORDER[idx + 1];
    });
  };

  useEffect(() => {
    if (!isPaused && !isInterrupted) {
      timerRef.current = setInterval(() => {
        processNext();
        setWorkBudget(prev => {
          const next = prev - 15;
          if (next <= 0) {
            setIsInterrupted(true);
            return 0;
          }
          return next;
        });
      }, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, isInterrupted]);

  const handleResume = () => {
    setIsInterrupted(false);
    setWorkBudget(100);
    setIsPaused(false);
  };

  const simulateInterrupt = () => {
    setIsInterrupted(true);
    setIsPaused(true);
  };

  return (
    <div className="flex flex-col gap-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 overflow-hidden shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-8">
        <div>
          <h3 className="text-2xl font-black text-zinc-100 flex items-center gap-3">
            <Share2 className="text-indigo-500" size={28} />
            Fiber Work Loop
          </h3>
          <p className="text-zinc-500 mt-2 max-w-xl text-sm">
            React Fiber turns recursion into a linked-list walkthrough. This allows it to <strong>yield</strong> execution to the browser if a frame is taking too long.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
          <button 
            onClick={() => { setIsPaused(!isPaused); if (isInterrupted) handleResume(); }}
            className={`p-3 rounded-lg transition-all ${isPaused ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
          >
            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
          <button 
            onClick={processNext}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all"
            title="Step Forward"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <div className="w-[1px] h-8 bg-zinc-800 mx-2" />
          <button 
            onClick={simulateInterrupt}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all text-xs font-bold uppercase tracking-widest"
          >
            <Zap size={14} fill="currentColor" />
            Interrupt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Main Thread Budget */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Frame Budget</span>
              <span className="text-[10px] font-mono text-indigo-400">16.6ms</span>
            </div>
            
            <div className="relative h-40 w-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden flex flex-col justify-end p-1">
              <motion.div 
                className={`w-full rounded-lg ${isInterrupted ? 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]'}`}
                initial={{ height: '100%' }}
                animate={{ height: `${workBudget}%` }}
                transition={{ type: 'spring', damping: 20 }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white/20 uppercase tracking-tighter rotate-90">Time Remaining</span>
              </div>
            </div>

            {isInterrupted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest">
                  <AlertCircle size={14} /> High Priority Task
                </div>
                <p className="text-[10px] text-rose-200/60 leading-relaxed italic">
                  An input event (click/scroll) detected! React yields the main thread to keep the UI responsive.
                </p>
                <button 
                  onClick={handleResume}
                  className="w-full mt-2 py-2 bg-rose-500 hover:bg-rose-400 text-white text-[10px] font-bold rounded-lg transition-colors"
                >
                  RESUME WORK
                </button>
              </motion.div>
            )}
          </div>

          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-4">
             <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Work Stats
             </h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Current Unit</span>
                  <span className="text-xs font-mono text-indigo-400">{currentFiberId || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-400">Mode</span>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-tighter">Concurrent</span>
                </div>
             </div>
          </div>
        </div>

        {/* Center: Fiber Tree Visualization */}
        <div className="lg:col-span-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl p-8 min-h-[500px] flex items-center justify-center relative">
          <div className="flex flex-col items-center gap-12">
            <FiberTreeNode id="root" currentId={currentFiberId} />
            <div className="flex gap-16">
              <FiberTreeNode id="nav" currentId={currentFiberId} />
              <FiberTreeNode id="main" currentId={currentFiberId} />
            </div>
            <FiberTreeNode id="list" currentId={currentFiberId} />
            <div className="flex gap-8">
              <FiberTreeNode id="item1" currentId={currentFiberId} />
              <FiberTreeNode id="item2" currentId={currentFiberId} />
            </div>
          </div>

          {/* Connection lines would go here, but for simplicity we use layout */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                Work-in-Progress (WIP)
             </div>
             <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700" />
                Idle Fiber
             </div>
          </div>
        </div>

        {/* Right: Fiber Data Model */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {currentFiberId ? (
              <motion.div
                key={currentFiberId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Processing Fiber</span>
                  <h4 className="text-2xl font-black text-white mt-1">{FIBER_TREE[currentFiberId].type}</h4>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Internal Pointers</span>
                    <div className="space-y-2 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-600">child:</span>
                        <span className="text-zinc-300">{FIBER_TREE[currentFiberId].child || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">sibling:</span>
                        <span className="text-zinc-300">{FIBER_TREE[currentFiberId].sibling || 'null'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-600">return:</span>
                        <span className="text-zinc-300">{FIBER_TREE[currentFiberId].return || 'null'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Work Loop Insight</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                      {currentFiberId === 'root' && "Checking root for updates. Found App component."}
                      {currentFiberId === 'app' && "Running App(props). Reconciling Nav and Main."}
                      {currentFiberId === 'nav' && "Nav has no children. Moving to next sibling (Main)."}
                      {currentFiberId === 'main' && "Processing Main. Moving down to List child."}
                      {currentFiberId === 'list' && "Reconciling List items A and B."}
                      {currentFiberId === 'item1' && "Item 1 complete. Moving to Sibling: Item 2."}
                      {currentFiberId === 'item2' && "All siblings complete. Returning to List parent."}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-zinc-950/30 border border-zinc-800 border-dashed rounded-2xl p-12 text-center">
                <p className="text-xs text-zinc-600 italic">Press Play to begin the work loop</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FiberTreeNode: React.FC<{ id: string, currentId: string | null }> = ({ id, currentId }) => {
  const fiber = FIBER_TREE[id];
  const isActive = currentId === id;
  const isProcessed = currentId && FIBER_ORDER.indexOf(currentId) > FIBER_ORDER.indexOf(id);

  return (
    <motion.div 
      layout
      className={`w-28 h-12 rounded-xl border flex flex-col items-center justify-center transition-all duration-500 relative ${
        isActive 
        ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110 z-10' 
        : (isProcessed ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-zinc-900 border-zinc-800 text-zinc-500')
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-tight">{fiber.type}</span>
      {isActive && (
        <motion.div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-lg"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </motion.div>
      )}
    </motion.div>
  );
};
