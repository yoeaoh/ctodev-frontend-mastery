import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shuffle, Plus, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface ListItem {
  id: string;
  text: string;
  color: string;
}

const COLORS = [
  'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500', 'bg-fuchsia-500'
];

const INITIAL_ITEMS: ListItem[] = [
  { id: '1', text: 'Alice (Senior)', color: 'bg-indigo-500' },
  { id: '2', text: 'Bob (Lead)', color: 'bg-rose-500' },
  { id: '3', text: 'Charlie (Junior)', color: 'bg-emerald-500' },
];

export const KeyStabilityDemo: React.FC = () => {
  const [items, setItems] = useState<ListItem[]>(INITIAL_ITEMS);
  const [useStableKeys, setUseStableKeys] = useState(false);
  const [renderCount, setRenderCount] = useState<Record<string, number>>({});
  const [lastAction, setLastAction] = useState<string>('');

  const shuffle = () => {
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
    setLastAction('shuffled');
  };

  const addFirst = () => {
    const newId = Math.random().toString(36).substr(2, 5);
    const newItem = {
      id: newId,
      text: `New Dev (${newId})`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    setItems(prev => [newItem, ...prev]);
    setLastAction('added');
  };

  const reset = () => {
    setItems(INITIAL_ITEMS);
    setRenderCount({});
    setLastAction('reset');
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
        <div className="space-y-3">
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <Zap className="text-amber-500" size={24} />
            Key Stability Lab
          </h3>
          <p className="text-zinc-500 text-sm max-w-lg leading-relaxed">
            When you add an element to the <strong>start</strong> of a list using <code className="bg-rose-500/10 text-rose-400 px-1 rounded">index</code> as a key, React thinks <em>every</em> item has changed.
          </p>
        </div>

        <div className="flex flex-col gap-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 min-w-[280px]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Reconciliation Strategy</span>
          <div className="flex items-center justify-between p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button 
              onClick={() => setUseStableKeys(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${!useStableKeys ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              index
            </button>
            <button 
              onClick={() => setUseStableKeys(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all ${useStableKeys ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              unique id
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {useStableKeys ? (
               <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
                 <CheckCircle2 size={12} /> Stable Identity
               </div>
            ) : (
               <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase animate-pulse">
                 <AlertCircle size={12} /> Identity Mismatch
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-4">
           <button onClick={addFirst} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
             <Plus size={18} /> Add to Start
           </button>
           <button onClick={shuffle} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
             <Shuffle size={18} /> Shuffle List
           </button>
           <button onClick={reset} className="w-full py-2 text-zinc-600 hover:text-zinc-400 text-xs font-bold uppercase tracking-widest transition-colors">
             Reset List
           </button>

           <div className="mt-8 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
             <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">What to look for:</h4>
             <ul className="space-y-2 text-[10px] text-zinc-400 italic">
               <li>• With <span className="text-rose-400">index</span>, the items won't animate their positions correctly.</li>
               <li>• Notice the "Render Count" badges on the right.</li>
               <li>• With <span className="text-emerald-400">unique id</span>, React "moves" the DOM nodes instead of re-painting them.</li>
             </ul>
           </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 rounded-3xl p-8 min-h-[400px]">
           <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active List Preview</span>
              <div className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
                key={'{'} {useStableKeys ? 'item.id' : 'index'} {'}'}
              </div>
           </div>

           <div className="space-y-3">
             <AnimatePresence mode="popLayout">
               {items.map((item, index) => (
                 <RenderableItem 
                   key={useStableKeys ? item.id : index} 
                   item={item} 
                   index={index} 
                   useStableKeys={useStableKeys}
                 />
               ))}
             </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
};

const RenderableItem: React.FC<{ item: ListItem, index: number, useStableKeys: boolean }> = ({ item, index, useStableKeys }) => {
  const renderRef = useRef(0);
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    renderRef.current += 1;
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), 800);
    return () => clearTimeout(timer);
  }, [item, index, useStableKeys]); // Effectively triggers on any "perceived" change

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-500 ${
        highlight 
        ? (useStableKeys ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-rose-500/10 border-rose-500/50') 
        : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${item.color} shadow-lg`}>
          <User size={18} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{item.text}</div>
          <div className="text-[10px] font-mono text-zinc-500">ID: {item.id} | Index: {index}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
           <span className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter">Render Count</span>
           <span className={`text-xs font-mono font-bold ${renderRef.current > 1 ? 'text-amber-400' : 'text-zinc-500'}`}>
             {renderRef.current}
           </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${highlight ? (useStableKeys ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]') : 'bg-zinc-800'}`} />
      </div>
    </motion.div>
  );
};
