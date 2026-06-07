import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Zap, RotateCcw, ChevronRight, ChevronLeft, Info, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VNode {
  type: string;
  props?: Record<string, any>;
  children?: (VNode | string)[];
  key?: string | number | null;
}

interface DiffStep {
  title: string;
  description: string;
  oldNodePath: number[]; 
  newNodePath: number[];
  action: 'update' | 'create' | 'delete' | 'replace' | 'move' | 'none';
  domOperation?: string;
  explanation?: string;
  isWarning?: boolean;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  oldVDOM: VNode;
  newVDOM: VNode;
  steps: DiffStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'vdom-diff-basic',
    name: '1. Basic Heuristics',
    description: 'React compares nodes level-by-level using type checks and text comparisons.',
    oldVDOM: {
      type: 'div',
      props: { className: 'container' },
      children: [
        { type: 'h1', children: ['Title'] },
        { type: 'p', children: ['Content'] }
      ]
    },
    newVDOM: {
      type: 'div',
      props: { className: 'container' },
      children: [
        { type: 'h1', children: ['New Title'] },
        { type: 'p', children: ['Content'] },
        { type: 'footer', children: ['Footer'] }
      ]
    },
    steps: [
      {
        title: 'Initial State',
        description: 'The current DOM reflects the initial VNode tree.',
        oldNodePath: [],
        newNodePath: [],
        action: 'none',
        explanation: 'React holds this VNode as the "current tree" in its memoized state.'
      },
      {
        title: 'Compare Roots',
        description: 'Types match: "div" === "div".',
        oldNodePath: [],
        newNodePath: [],
        action: 'none',
        explanation: 'Since the types are identical, React keeps the DOM node and begins a shallow diff of the properties (className).'
      },
      {
        title: 'Update Text Content',
        description: 'h1 type matches, but text changed: "Title" -> "New Title".',
        oldNodePath: [0, 0],
        newNodePath: [0, 0],
        action: 'update',
        domOperation: 'h1.textContent = "New Title"',
        explanation: 'React performs a direct update to the text nodeValue. No need to touch the h1 tag itself.'
      },
      {
        title: 'Bailout (No Change)',
        description: 'p type matches and text matches: "Content" === "Content".',
        oldNodePath: [1, 0],
        newNodePath: [1, 0],
        action: 'none',
        explanation: 'This is a "bailout". React skips the DOM update because the values are referentially equal.'
      },
      {
        title: 'Insert New Element',
        description: 'New footer element detected in the new tree.',
        oldNodePath: [],
        newNodePath: [2],
        action: 'create',
        domOperation: 'div.appendChild(document.createElement("footer"))',
        explanation: 'The new children list is longer than the old one. React creates and appends the remaining nodes.'
      }
    ]
  },
  {
    id: 'vdom-diff-keys',
    name: '2. The "key={index}" Trap',
    description: 'Using array indices as keys can lead to massive performance hits and state bugs.',
    oldVDOM: {
      type: 'ul',
      children: [
        { type: 'li', key: 0, children: ['Item A'] },
        { type: 'li', key: 1, children: ['Item B'] },
        { type: 'li', key: 2, children: ['Item C'] }
      ]
    },
    newVDOM: {
      type: 'ul',
      children: [
        { type: 'li', key: 0, children: ['New!'] },
        { type: 'li', key: 1, children: ['Item A'] },
        { type: 'li', key: 2, children: ['Item B'] },
        { type: 'li', key: 3, children: ['Item C'] }
      ]
    },
    steps: [
      {
        title: 'Insert at Start',
        description: 'We added "New!" to the top of the list using index as key.',
        oldNodePath: [],
        newNodePath: [],
        action: 'none',
        explanation: 'Because we used index, "New!" gets key=0, "Item A" gets key=1, etc. This breaks identity.'
      },
      {
        title: 'Identity Mismatch (key=0)',
        description: 'React thinks Item A (old key=0) became "New!" (new key=0).',
        oldNodePath: [0, 0],
        newNodePath: [0, 0],
        action: 'update',
        domOperation: 'li[0].textContent = "New!"',
        explanation: 'Instead of moving Item A, React overwrites it. If this was an <input>, the user\'s typed value would stay in the first box but now apply to "New!".',
        isWarning: true
      },
      {
        title: 'Cascade of Updates',
        description: 'React now thinks Item B (key=1) became Item A (key=1).',
        oldNodePath: [1, 0],
        newNodePath: [1, 0],
        action: 'update',
        domOperation: 'li[1].textContent = "Item A"',
        explanation: 'Every single item in the list is now being updated in the DOM because their index-based keys shifted.',
        isWarning: true
      },
      {
        title: 'Redundant Append',
        description: 'React adds a new Item C at the end.',
        oldNodePath: [],
        newNodePath: [3],
        action: 'create',
        domOperation: 'ul.appendChild(liC)',
        explanation: 'Summary: 3 redundant text updates + 1 append. With unique keys, this would be 0 updates + 1 insert.'
      }
    ]
  }
];

export const VDOMDiffVisualizer: React.FC = () => {
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const scenario = SCENARIOS[activeScenarioIdx];
  const step = scenario.steps[currentStep];

  const next = () => setCurrentStep(s => Math.min(s + 1, scenario.steps.length - 1));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const reset = () => setCurrentStep(0);

  const switchScenario = (idx: number) => {
    setActiveScenarioIdx(idx);
    setCurrentStep(0);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-100 w-full max-w-6xl mx-auto shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layers size={20} />
            <h3 className="text-xl font-bold tracking-tight">VDOM Reconciliation Lab</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => switchScenario(idx)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  activeScenarioIdx === idx 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                )}
              >
                {s.name}
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
            {currentStep + 1} / {scenario.steps.length}
          </span>
          <button onClick={next} disabled={currentStep === scenario.steps.length - 1} className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-lg text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: VDOM Tree Comparison */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Tree (Old)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase tracking-tighter">Current DOM</span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 min-h-[350px] relative overflow-hidden flex items-center justify-center">
               <VDOMTree node={scenario.oldVDOM} activePath={step.oldNodePath} action={step.newNodePath.length === step.oldNodePath.length && step.action === 'replace' ? 'delete' : (step.oldNodePath.length > 0 && step.action === 'delete' ? 'delete' : 'none')} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Work-In-Progress (New)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-tighter">Next Frame</span>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 min-h-[350px] relative overflow-hidden flex items-center justify-center">
               <VDOMTree node={scenario.newVDOM} activePath={step.newNodePath} action={step.action} />
            </div>
          </div>
        </div>

        {/* Right: Explainer Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
              <Info size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Reconciliation Step</span>
            </div>
            
            <h4 className="text-lg font-bold text-zinc-100 mb-2">{step.title}</h4>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{step.description}</p>

            {step.domOperation && (
              <div className="mb-6">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Zap size={12} className="text-amber-500" />
                  DOM Patch
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 font-mono text-xs text-emerald-400 shadow-inner overflow-x-auto">
                  {step.domOperation}
                </div>
              </div>
            )}

            {step.isWarning && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 animate-pulse">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-[10px] text-rose-300 font-bold uppercase leading-tight">Identity Lost! Redundant DOM update triggered.</p>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-zinc-800/50">
               <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                 <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Algorithm Insight</h5>
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

const VDOMTree: React.FC<{ node: VNode | string, activePath: number[], action: string, path?: number[] }> = ({ node, activePath, action, path = [] }) => {
  const isString = typeof node === 'string';
  const isActive = JSON.stringify(path) === JSON.stringify(activePath);
  
  const getActionStyles = () => {
    if (!isActive) return "border-zinc-800 text-zinc-400 bg-zinc-900/40";
    switch (action) {
      case 'update': return "border-amber-500/50 bg-amber-500/10 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      case 'create': return "border-emerald-500/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      case 'delete': return "border-rose-500/50 bg-rose-500/10 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
      case 'replace': return "border-indigo-500/50 bg-indigo-500/10 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
      case 'move': return "border-blue-500/50 bg-blue-500/10 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
      default: return "border-indigo-500 bg-indigo-500/10 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
    }
  };

  const Icon = () => {
    if (!isActive) return null;
    switch (action) {
      case 'update': return <RefreshCw size={10} className="animate-spin-slow" />;
      case 'create': return <Plus size={10} />;
      case 'delete': return <Minus size={10} />;
      default: return null;
    }
  };

  if (isString) {
    return (
      <motion.div 
        layout
        className={cn(
          "px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all duration-500 flex items-center gap-2",
          getActionStyles()
        )}
      >
        <span className="opacity-50">"</span>{node}<span className="opacity-50">"</span>
        <Icon />
      </motion.div>
    );
  }

  const vnode = node as VNode;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div 
        layout
        className={cn(
          "px-4 py-2 rounded-xl border transition-all duration-500 relative group",
          getActionStyles()
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs uppercase">&lt;{vnode.type}&gt;</span>
          {vnode.key !== undefined && vnode.key !== null && <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-mono">key: {vnode.key}</span>}
          <Icon />
        </div>
        
        {vnode.props && Object.keys(vnode.props).length > 0 && (
          <div className="mt-1.5 pt-1.5 border-t border-zinc-800/50 flex gap-2">
             {Object.entries(vnode.props).map(([k, v]) => (
               <span key={k} className="text-[8px] opacity-60 italic">{k}={JSON.stringify(v)}</span>
             ))}
          </div>
        )}
      </motion.div>

      {vnode.children && vnode.children.length > 0 && (
        <div className="flex gap-4 relative">
          <div className="absolute top-[-16px] left-1/2 w-[1px] h-4 bg-zinc-800" />
          
          {vnode.children.map((child, i) => (
            <VDOMTree 
              key={i} 
              node={child} 
              activePath={activePath} 
              action={action} 
              path={[...path, i]} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
