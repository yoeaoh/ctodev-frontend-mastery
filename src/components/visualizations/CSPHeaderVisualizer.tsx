import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldX, Terminal, Filter, Code2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CSPDirective {
  id: string;
  name: string;
  value: string;
  description: string;
}

const DIRECTIVES: CSPDirective[] = [
  { id: 'default-self', name: 'default-src', value: "'self'", description: "Only allow content from the same origin." },
  { id: 'script-none', name: 'script-src', value: "'none'", description: "Block all script execution." },
  { id: 'script-inline', name: 'script-src', value: "'unsafe-inline'", description: "Allow inline scripts (dangerous)." },
  { id: 'script-nonce', name: 'script-src', value: "'nonce-r4nd0m'", description: "Only allow scripts with matching nonce." },
  { id: 'script-dynamic', name: 'script-src', value: "'strict-dynamic'", description: "Allow scripts loaded by trusted scripts." },
];

interface ScriptExecution {
  id: string;
  type: 'inline' | 'external' | 'nonce';
  code: string;
  status: 'allowed' | 'blocked';
}

export const CSPHeaderVisualizer: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['default-self']);

  const toggleDirective = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getHeader = () => {
    const active = DIRECTIVES.filter(d => selectedIds.includes(d.id));
    const groups: Record<string, string[]> = {};
    active.forEach(d => {
      if (!groups[d.name]) groups[d.name] = [];
      groups[d.name].push(d.value);
    });
    return Object.entries(groups).map(([name, vals]) => `${name} ${vals.join(' ')}`).join('; ');
  };

  const checkStatus = (type: string, nonce?: boolean): 'allowed' | 'blocked' => {
    if (selectedIds.includes('script-none')) return 'blocked';
    if (type === 'inline') return selectedIds.includes('script-inline') ? 'allowed' : 'blocked';
    if (type === 'nonce') return selectedIds.includes('script-nonce') ? 'allowed' : 'blocked';
    return 'allowed';
  };

  const scripts: ScriptExecution[] = [
    { id: '1', type: 'inline', code: '<script>alert(1)</script>', status: checkStatus('inline') },
    { id: '2', type: 'nonce', code: '<script nonce="r4nd0m">...</script>', status: checkStatus('nonce') },
    { id: '3', type: 'external', code: '<script src="https://cdn.com/lib.js"></script>', status: checkStatus('external') },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
           <Shield className="text-white" size={24} />
        </div>
        <div>
           <h3 className="text-2xl font-black text-white">CSP Policy Builder</h3>
           <p className="text-zinc-500 text-sm">Select directives to see how they impact script execution.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Controls */}
        <div className="space-y-6">
          <div className="space-y-3">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block">Available Directives</span>
             {DIRECTIVES.map((d) => (
               <button
                 key={d.id}
                 onClick={() => toggleDirective(d.id)}
                 className={`w-full text-left p-4 rounded-xl border transition-all ${
                   selectedIds.includes(d.id) 
                   ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100' 
                   : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                 }`}
               >
                 <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold">{d.name} {d.value}</span>
                    {selectedIds.includes(d.id) && <ShieldCheck size={14} className="text-indigo-400" />}
                 </div>
                 <p className="text-[10px] opacity-60 leading-relaxed">{d.description}</p>
               </button>
             ))}
          </div>

          <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
             <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4">Resulting Header</span>
             <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-400 break-all leading-relaxed">
                Content-Security-Policy: {getHeader() || 'none'}
             </div>
          </div>
        </div>

        {/* Impact Visualizer */}
        <div className="space-y-6">
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block">Execution Simulation</span>
           <div className="space-y-4">
              {scripts.map((s) => (
                <div 
                  key={s.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 ${
                    s.status === 'allowed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${s.status === 'allowed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {s.status === 'allowed' ? <CheckCircle2 size={18} /> : <ShieldX size={18} />}
                     </div>
                     <div>
                        <code className="text-xs font-mono text-zinc-300">{s.code}</code>
                        <div className={`text-[9px] font-bold uppercase mt-1 tracking-tighter ${s.status === 'allowed' ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {s.status.toUpperCase()}
                        </div>
                     </div>
                  </div>

                  <AnimatePresence>
                    {s.status === 'blocked' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase tracking-widest shadow-lg"
                      >
                         <AlertTriangle size={10} />
                         CSP Block
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
           </div>

           <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
              <h5 className="text-xs font-bold text-indigo-300 mb-2 flex items-center gap-2">
                 <Terminal size={14} /> Security Console
              </h5>
              <div className="space-y-2 font-mono text-[10px] text-zinc-500">
                 {scripts.filter(s => s.status === 'blocked').map(s => (
                   <div key={s.id} className="flex gap-2">
                      <span className="text-rose-500">[Violated]</span>
                      <span>{s.type} script blocked by script-src directive.</span>
                   </div>
                 ))}
                 {scripts.every(s => s.status === 'allowed') && (
                   <div className="text-emerald-500/60 italic">No violations detected in this configuration.</div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
