import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Zap, Search, Globe, Clock, BarChart3, Info, AlertTriangle, CheckCircle2, Server } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  status: 'optimal' | 'warning' | 'critical';
  desc: string;
}

interface StrategyData {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
  bestFor: string;
  worstFor: string;
  visual: 'empty' | 'spinner' | 'content' | 'rsc';
}

const STRATEGIES: StrategyData[] = [
  {
    id: 'csr',
    name: 'CSR (Client-Side Rendering)',
    description: 'HTML is an empty shell. JavaScript fetches data and builds the UI on the client.',
    metrics: [
      { label: 'TTFB', value: '50ms', status: 'optimal', desc: 'Fast initial response' },
      { label: 'FCP', value: '1.2s', status: 'warning', desc: 'User sees spinner' },
      { label: 'TBT', value: '520ms', status: 'critical', desc: 'Heavy JS execution' },
      { label: 'LCP', value: '2.5s', status: 'critical', desc: 'Late content display' }
    ],
    bestFor: 'Dashboards, Admin panels, Logged-in experiences.',
    worstFor: 'SEO, Public landing pages, slow 3G connections.',
    visual: 'spinner'
  },
  {
    id: 'ssr',
    name: 'SSR (Server-Side Rendering)',
    description: 'Server generates full HTML on every request. Client "hydrates" to become interactive.',
    metrics: [
      { label: 'TTFB', value: '350ms', status: 'warning', desc: 'Server compute time' },
      { label: 'FCP', value: '400ms', status: 'optimal', desc: 'Immediate content' },
      { label: 'TBT', value: '650ms', status: 'critical', desc: 'Hydration tax' },
      { label: 'LCP', value: '800ms', status: 'optimal', desc: 'Fast visual load' }
    ],
    bestFor: 'E-commerce, News, SEO-critical content.',
    worstFor: 'Highly interactive apps (Miro, Figma) where hydration is too slow.',
    visual: 'content'
  },
  {
    id: 'ssg',
    name: 'SSG (Static Site Generation)',
    description: 'HTML is pre-built at build time. Delivered via CDN for maximum speed.',
    metrics: [
      { label: 'TTFB', value: '50ms', status: 'optimal', desc: 'Edge delivery' },
      { label: 'FCP', value: '50ms', status: 'optimal', desc: 'Instant paint' },
      { label: 'TBT', value: '350ms', status: 'warning', desc: 'JS hydration still needed' },
      { label: 'LCP', value: '300ms', status: 'optimal', desc: 'Fastest visual' }
    ],
    bestFor: 'Documentation, Marketing, Blogs.',
    worstFor: 'Real-time data, User-specific content.',
    visual: 'content'
  },
  {
    id: 'rsc',
    name: 'RSC (React Server Components)',
    description: 'Components render on server but send serialized VDOM, not HTML. ZERO client JS for server parts.',
    metrics: [
      { label: 'TTFB', value: '200ms', status: 'optimal', desc: 'Smart streaming' },
      { label: 'FCP', value: '250ms', status: 'optimal', desc: 'Fast streaming' },
      { label: 'TBT', value: '50ms', status: 'optimal', desc: 'No hydration needed' },
      { label: 'LCP', value: '400ms', status: 'optimal', desc: 'Optimized delivery' }
    ],
    bestFor: 'Modern complex apps, Hybrid content/interactive pages.',
    worstFor: 'Legacy stacks, apps needing complex client-side state in every component.',
    visual: 'rsc'
  }
];

export const RenderingStrategyComparator: React.FC = () => {
  const [selectedId, setSelectedId] = useState('csr');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const active = STRATEGIES.find(s => s.id === selectedId)!;

  const runSimulation = () => {
    setIsSimulating(true);
    setSimStep(0);
    const interval = setInterval(() => {
      setSimStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          return 3;
        }
        return prev + 1;
      });
    }, 800);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Controls */}
        <div className="lg:w-1/3 space-y-8">
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-2">
              <Zap className="text-indigo-500" size={24} />
              Strategy Comparator
            </h3>
            <p className="text-zinc-500 text-sm">Select a strategy to simulate performance metrics and user experience.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {STRATEGIES.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedId(s.id); setSimStep(3); }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedId === s.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-sm mb-1">{s.name}</div>
                <div className="text-[10px] opacity-60 line-clamp-1">{s.description}</div>
              </button>
            ))}
          </div>

          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className="w-full py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black rounded-2xl text-sm transition-all disabled:opacity-50"
          >
            {isSimulating ? 'SIMULATING...' : 'RUN PERFORMANCE SIM'}
          </button>
        </div>

        {/* Visualization & Metrics */}
        <div className="lg:w-2/3 space-y-8">
           {/* Visual Simulation */}
           <div className="h-64 bg-zinc-950 rounded-3xl border border-zinc-800 relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-4 left-6 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">User Experience Simulation</span>
              </div>

              <div className="w-full max-w-md px-8">
                 <AnimatePresence mode="wait">
                   {isSimulating ? (
                     <motion.div 
                       key="sim"
                       className="space-y-4"
                     >
                        {simStep === 0 && (
                          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center text-zinc-600 italic text-sm">
                            Requesting Page...
                          </motion.div>
                        )}
                        {simStep === 1 && (
                          <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} className="flex flex-col items-center gap-4">
                             {active.visual === 'spinner' ? (
                               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                             ) : active.visual === 'empty' ? (
                               <div className="w-full h-4 bg-zinc-900 rounded-full" />
                             ) : (
                               <div className="w-full space-y-3">
                                  <div className="h-6 bg-zinc-900 rounded-lg w-3/4" />
                                  <div className="h-4 bg-zinc-900 rounded-lg w-full" />
                               </div>
                             )}
                             <span className="text-[10px] font-bold text-indigo-400 uppercase">First Contentful Paint</span>
                          </motion.div>
                        )}
                        {simStep >= 2 && (
                          <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-4">
                             <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3 mb-4">
                                   <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                      <Layout size={20} />
                                   </div>
                                   <div>
                                      <div className="h-3 bg-zinc-800 rounded w-24 mb-1" />
                                      <div className="h-2 bg-zinc-800/50 rounded w-16" />
                                   </div>
                                </div>
                                <div className="space-y-2">
                                   <div className="h-2 bg-zinc-800 rounded w-full" />
                                   <div className="h-2 bg-zinc-800 rounded w-5/6" />
                                </div>
                             </div>
                             <div className="flex justify-center">
                                <span className={`text-[10px] font-bold uppercase py-1 px-3 rounded-full ${simStep === 3 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                   {simStep === 3 ? 'Interactive' : 'Hydrating...'}
                                </span>
                             </div>
                          </motion.div>
                        )}
                     </motion.div>
                   ) : (
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                              <span className="text-[9px] font-black text-zinc-600 uppercase mb-2 block">Best For</span>
                              <p className="text-xs text-zinc-300">{active.bestFor}</p>
                           </div>
                           <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                              <span className="text-[9px] font-black text-zinc-600 uppercase mb-2 block">Worst For</span>
                              <p className="text-xs text-zinc-300">{active.worstFor}</p>
                           </div>
                        </div>
                        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-3">
                           <Info size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                           <p className="text-[11px] text-indigo-300/70 leading-relaxed italic">
                             {active.description}
                           </p>
                        </div>
                     </div>
                   )}
                 </AnimatePresence>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {active.metrics.map(m => (
                <div key={m.label} className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{m.label}</span>
                      {m.status === 'optimal' ? <CheckCircle2 size={12} className="text-emerald-500" /> : 
                       m.status === 'warning' ? <Clock size={12} className="text-amber-500" /> : 
                       <AlertTriangle size={12} className="text-rose-500" />}
                   </div>
                   <div className="text-2xl font-black text-white mb-1">{m.value}</div>
                   <div className="text-[9px] text-zinc-600 font-medium">{m.desc}</div>
                </div>
              ))}
           </div>

           {/* Comparison Tooltip */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h5 className="text-xs font-bold text-zinc-300 mb-4 flex items-center gap-2 uppercase tracking-widest">
                 <BarChart3 size={16} className="text-indigo-500" />
                 Senior Architecture Insight
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Latency Source</span>
                    <p className="text-xs text-zinc-400">
                       {active.id === 'csr' ? 'Heavy Client JS and data fetching waterfalls.' : 
                        active.id === 'ssr' ? 'Server-side rendering latency + client hydration tax.' : 
                        active.id === 'ssg' ? 'Static delivery is instant, but build times grow linearly.' : 
                        'Streaming RSC payload avoids hydration but requires Node.js runtime.'}
                    </p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Cost & Infrastructure</span>
                    <p className="text-xs text-zinc-400">
                       {active.id === 'ssg' ? 'Cheapest. S3/CDN only.' : 
                        active.id === 'csr' ? 'Low. Static hosting + serverless API.' : 
                        'High. Continuous server resources needed for every request.'}
                    </p>
                 </div>
                 <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Modern Recommendation</span>
                    <p className="text-xs text-zinc-400 font-medium text-indigo-400">
                       {active.id === 'rsc' ? 'Ideal for most modern apps using Next.js.' : 
                        active.id === 'ssg' ? 'Best for blogs and documentation.' : 
                        'Consider migrating to hybrid models for better TBT.'}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
