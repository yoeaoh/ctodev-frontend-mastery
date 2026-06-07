import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Layout, Paintbrush, Layers, Code, Zap } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type PipelineStage = 'Parsing' | 'Render Tree' | 'Layout' | 'Paint' | 'Composite';

interface PropertyImpact {
  name: string;
  stages: PipelineStage[];
  description: string;
}

const properties: PropertyImpact[] = [
  {
    name: 'width / height',
    stages: ['Layout', 'Paint', 'Composite'],
    description: 'Changing geometry forces the browser to recalculate the position and size of all affected elements.'
  },
  {
    name: 'background-color',
    stages: ['Paint', 'Composite'],
    description: 'Geometry is unchanged, but the visual appearance needs to be repainted.'
  },
  {
    name: 'transform / opacity',
    stages: ['Composite'],
    description: 'The compositor can handle these changes on a separate thread, avoiding both layout and paint for high performance.'
  }
];

export const BrowserRenderingPipeline: React.FC = () => {
  const [selectedProp, setSelectedProp] = useState<PropertyImpact | null>(null);

  const stages: { name: PipelineStage; icon: React.ReactNode }[] = [
    { name: 'Parsing', icon: <Code size={20} /> },
    { name: 'Render Tree', icon: <Zap size={20} /> },
    { name: 'Layout', icon: <Layout size={20} /> },
    { name: 'Paint', icon: <Paintbrush size={20} /> },
    { name: 'Composite', icon: <Layers size={20} /> },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
          <Zap className="text-yellow-500" />
          The Browser Rendering Pipeline
        </h2>
        <p className="text-zinc-400">
          Trace how the browser turns code into pixels. Click a CSS property below to see which pipeline stages are triggered.
        </p>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative flex justify-between items-center px-4 py-12 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0" />
        
        {stages.map((stage, idx) => {
          const isActive = selectedProp?.stages.includes(stage.name);
          return (
            <div key={stage.name} className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                animate={{
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-zinc-900)',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-zinc-700)',
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive ? '0 0 20px rgba(99, 102, 241, 0.4)' : 'none'
                }}
                className={cn(
                  "w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-colors",
                  isActive ? "text-white" : "text-zinc-500"
                )}
              >
                {stage.icon}
              </motion.div>
              <div className="flex flex-col items-center text-center">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  isActive ? "text-indigo-400" : "text-zinc-600"
                )}>
                  Stage {idx + 1}
                </span>
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap",
                  isActive ? "text-zinc-100" : "text-zinc-500"
                )}>
                  {stage.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Property Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {properties.map((prop) => (
          <button
            key={prop.name}
            onClick={() => setSelectedProp(prop)}
            className={cn(
              "p-4 rounded-xl border transition-all text-left group",
              selectedProp?.name === prop.name
                ? "bg-indigo-500/10 border-indigo-500 shadow-lg"
                : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800"
            )}
          >
            <div className="font-mono text-sm text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
              {prop.name}
            </div>
            <div className="text-xs text-zinc-500 leading-relaxed">
              {prop.description}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation Panel */}
      <AnimatePresence mode="wait">
        {selectedProp && (
          <motion.div
            key={selectedProp.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-zinc-800/30 rounded-xl border border-zinc-800"
          >
            <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Zap size={14} /> Performance Analysis
            </h4>
            <div className="space-y-4">
              <p className="text-zinc-200 leading-relaxed">
                When you modify <code className="px-1.5 py-0.5 bg-zinc-950 rounded text-indigo-300">{selectedProp.name}</code>, 
                the browser must re-run the following stages:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProp.stages.map((s) => (
                  <span key={s} className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-200 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
              <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 mt-4">
                <p className="text-xs text-zinc-500 italic">
                  Tip: Aim for animations that only trigger the <strong>Composite</strong> stage to achieve 60fps (16.6ms frame budget) consistently.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
