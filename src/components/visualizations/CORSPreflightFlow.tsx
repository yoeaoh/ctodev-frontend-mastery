import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Send, ArrowRight, CheckCircle2, XCircle, Info, Activity, Clock } from 'lucide-react';

interface PreflightStep {
  id: number;
  title: string;
  description: string;
  sender: 'browser' | 'server';
  message: string;
  headers: Record<string, string>;
  status: 'pending' | 'success' | 'error';
}

const FLOW_STEPS: PreflightStep[] = [
  {
    id: 1,
    title: 'JavaScript Trigger',
    description: 'The frontend application attempts a non-simple request (e.g., application/json or custom headers).',
    sender: 'browser',
    message: 'fetch("https://api.com/data")',
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'val'
    },
    status: 'pending'
  },
  {
    id: 2,
    title: 'OPTIONS Preflight',
    description: 'The browser automatically sends a preflight request to verify if the actual request is safe to send.',
    sender: 'browser',
    message: 'OPTIONS /data HTTP/1.1',
    headers: {
      'Origin': 'https://myapp.com',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'X-Custom-Header'
    },
    status: 'pending'
  },
  {
    id: 3,
    title: 'Server Verification',
    description: 'The server checks the Origin and requested methods/headers against its own security policy.',
    sender: 'server',
    message: 'HTTP/1.1 204 No Content',
    headers: {
      'Access-Control-Allow-Origin': 'https://myapp.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Custom-Header',
      'Access-Control-Max-Age': '86400'
    },
    status: 'success'
  },
  {
    id: 4,
    title: 'Actual Request',
    description: 'Preflight approved! The browser now sends the real POST request with the data.',
    sender: 'browser',
    message: 'POST /data HTTP/1.1',
    headers: {
      'Origin': 'https://myapp.com',
      'Content-Type': 'application/json'
    },
    status: 'success'
  }
];

export const CORSPreflightFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => setCurrentStep(s => Math.min(s + 1, FLOW_STEPS.length - 1));
  const prev = () => setCurrentStep(s => Math.max(s - 1, 0));
  const reset = () => setCurrentStep(0);

  const step = FLOW_STEPS[currentStep];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-8 mb-8">
        <div>
          <h3 className="text-2xl font-black text-zinc-100 flex items-center gap-3">
            <Activity className="text-indigo-500" size={28} />
            CORS Preflight Flow
          </h3>
          <p className="text-zinc-500 mt-2 max-w-xl text-sm">
            Understand the invisible "handshake" that happens when your browser makes cross-origin requests.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800">
           <button 
             onClick={prev} 
             disabled={currentStep === 0}
             className="p-2 hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-zinc-400 transition-colors"
           >
             <ArrowRight size={20} className="rotate-180" />
           </button>
           <span className="text-xs font-mono w-16 text-center text-zinc-500">
             Step {currentStep + 1} / {FLOW_STEPS.length}
           </span>
           <button 
             onClick={next} 
             disabled={currentStep === FLOW_STEPS.length - 1}
             className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 rounded-lg text-white transition-colors"
           >
             <ArrowRight size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative">
        {/* The Connection Line */}
        <div className="hidden lg:block absolute top-1/2 left-[20%] right-[20%] h-px border-t border-dashed border-zinc-800 -translate-y-1/2 z-0" />

        {/* Browser Node */}
        <div className="lg:col-span-3 flex flex-col items-center gap-4 z-10">
          <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${step.sender === 'browser' ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <Globe size={48} />
          </div>
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Client</span>
            <p className="text-[10px] text-zinc-600 font-mono">myapp.com</p>
          </div>
        </div>

        {/* Animation Area */}
        <div className="lg:col-span-6 h-[400px] flex flex-col gap-6 relative">
           <div className="flex-1 bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                 <Clock size={12} /> Live Header Inspector
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 space-y-6"
                >
                  <div>
                    <div className="px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-indigo-400 font-mono text-xs inline-block mb-3">
                      {step.message}
                    </div>
                    <div className="space-y-2">
                       {Object.entries(step.headers).map(([key, val]) => (
                         <div key={key} className="flex justify-between items-center text-xs font-mono border-b border-zinc-900/50 pb-1">
                           <span className="text-zinc-500">{key}:</span>
                           <span className="text-zinc-300">{val}</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                     <h5 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">{step.title}</h5>
                     <p className="text-xs text-zinc-500 leading-relaxed italic">{step.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Animated Packet */}
              <motion.div 
                className="absolute top-1/2 left-0 right-0 h-1 flex justify-center pointer-events-none"
                initial={false}
              >
                 <motion.div
                   key={currentStep}
                   initial={{ x: step.sender === 'browser' ? '-200%' : '200%', opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ type: 'spring', damping: 15 }}
                   className="p-2 bg-indigo-500 rounded-full shadow-[0_0_20px_#6366f1]"
                 >
                   <Send size={12} className={step.sender === 'server' ? 'rotate-180' : ''} />
                 </motion.div>
              </motion.div>
           </div>
        </div>

        {/* Server Node */}
        <div className="lg:col-span-3 flex flex-col items-center gap-4 z-10">
          <div className={`p-6 rounded-3xl border-2 transition-all duration-500 ${step.sender === 'server' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
            <Server size={48} />
          </div>
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Server</span>
            <p className="text-[10px] text-zinc-600 font-mono">api.com</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-zinc-800 flex flex-wrap gap-4">
         {FLOW_STEPS.map((s, idx) => (
           <button
             key={s.id}
             onClick={() => setCurrentStep(idx)}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all ${
               currentStep === idx 
               ? 'bg-indigo-600 border-indigo-500 text-white' 
               : (currentStep > idx ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600')
             }`}
           >
             {currentStep > idx ? <CheckCircle2 size={12} /> : <span>{s.id}</span>}
             {s.title}
           </button>
         ))}
      </div>
    </div>
  );
};
