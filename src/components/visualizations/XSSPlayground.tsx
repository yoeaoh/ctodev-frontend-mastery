import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Zap, Lock, Unlock, Eye, EyeOff, Bug, Info, Terminal } from 'lucide-react';

interface XSSResult {
  type: 'escape' | 'danger' | 'csp';
  html: string;
  isExecuted: boolean;
}

export const XSSPlayground: React.FC = () => {
  const [payload, setPayload] = useState("<img src=x onerror=\"alert('XSS!')\">");
  const [mode, setMode] = useState<'escape' | 'danger'>('escape');
  const [cspEnabled, setCspEnabled] = useState(false);
  const [cspViolation, setCspViolation] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sandboxContent = `
    <!DOCTYPE html>
    <html>
      <head>
        ${cspEnabled ? `
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'unsafe-inline';">
        ` : ''}
        <style>
          body { font-family: sans-serif; color: #94a3b8; background: #09090b; padding: 20px; margin: 0; font-size: 14px; }
          .label { color: #6366f1; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; display: block; }
          .output { border: 1px border-zinc-800; padding: 12px; border-radius: 8px; background: #18181b; min-height: 50px; word-break: break-all; }
          img { border: 1px solid #3f3f46; max-width: 100px; }
        </style>
      </head>
      <body>
        <span class="label">Rendered Output:</span>
        <div id="root" class="output"></div>
        <script>
          window.addEventListener('securitypolicyviolation', (e) => {
            window.parent.postMessage({ type: 'csp-violation', directive: e.violatedDirective }, '*');
          });

          const root = document.getElementById('root');
          const mode = "${mode}";
          const payload = ${JSON.stringify(payload)};

          if (mode === 'escape') {
            root.textContent = payload;
          } else {
            try {
              root.innerHTML = payload;
              // Check if images with onerror were added and trigger them if not blocked by CSP
              const images = root.getElementsByTagName('img');
              for (let img of images) {
                if (img.onerror) {
                   // This is a simulation since src=x will trigger it naturally
                }
              }
            } catch (e) {
              root.textContent = "Error rendering: " + e.message;
            }
          }
        </script>
      </body>
    </html>
  `;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'csp-violation') {
        setCspViolation(event.data.directive);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const refreshIframe = () => {
    setCspViolation(null);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Configuration Side */}
      <div className="space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={18} className="text-indigo-500" />
              Attack Configuration
            </h4>
            <div className="flex gap-2">
              <button 
                onClick={refreshIframe}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-all"
                title="Reset Sandbox"
              >
                <Zap size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                XSS Payload
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
                placeholder="Enter HTML/Script payload..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                  React Rendering
                </label>
                <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => { setMode('escape'); setCspViolation(null); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mode === 'escape' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Escaped
                  </button>
                  <button
                    onClick={() => { setMode('danger'); setCspViolation(null); }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mode === 'danger' ? 'bg-rose-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    Danger
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">
                  Security Policy
                </label>
                <button
                  onClick={() => { setCspEnabled(!cspEnabled); setCspViolation(null); }}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                    cspEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {cspEnabled ? <ShieldCheck size={14} /> : <Shield size={14} />}
                  CSP {cspEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h5 className="text-xs font-bold text-zinc-300 mb-3 flex items-center gap-2">
            <Info size={14} className="text-indigo-400" />
            Senior Insight
          </h5>
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            {mode === 'escape' 
              ? "React's default JSX behavior is to treat all variable interpolations as strings (textContent). This automatically neutralizes XSS by not parsing HTML tags."
              : "dangerouslySetInnerHTML bypasses React's security layer. It's only safe if the input is sanitized by a library like DOMPurify on the server or client."}
            {cspEnabled && " Even if Danger mode is used, a strict CSP can block the execution of injected scripts or inline event handlers."}
          </p>
        </div>
      </div>

      {/* Result Side */}
      <div className="space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px] shadow-2xl">
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                mode === 'escape' ? 'bg-emerald-500' : (cspEnabled && cspViolation ? 'bg-amber-500' : 'bg-rose-500')
              }`} />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Secure Sandbox Environment</span>
            </div>
            {cspEnabled && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-mono border border-emerald-500/20">
                CSP: script-src 'none'
              </span>
            )}
          </div>

          <div className="flex-1 relative bg-zinc-950">
             <iframe
               key={iframeKey}
               ref={iframeRef}
               srcDoc={sandboxContent}
               className="w-full h-full border-none"
               sandbox="allow-scripts"
               title="XSS Sandbox"
             />
             
             <AnimatePresence>
               {cspViolation && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="absolute inset-0 flex items-center justify-center p-8 bg-zinc-950/80 backdrop-blur-sm"
                 >
                   <div className="bg-zinc-900 border-2 border-amber-500/50 rounded-2xl p-6 max-w-sm text-center shadow-2xl">
                     <ShieldAlert className="text-amber-500 mx-auto mb-4" size={48} />
                     <h5 className="text-lg font-bold text-white mb-2">CSP VIOLATION</h5>
                     <p className="text-sm text-zinc-400 mb-4">
                       The browser refused to execute the script because it violates the policy:
                     </p>
                     <code className="block bg-zinc-950 p-2 rounded text-xs text-amber-200 font-mono mb-6">
                       {cspViolation}
                     </code>
                     <button 
                       onClick={() => setCspViolation(null)}
                       className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors"
                     >
                       Acknowledge
                     </button>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="p-4 bg-zinc-900/30 border-t border-zinc-800 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex flex-col">
                   <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Status</span>
                   <span className={`text-xs font-bold ${
                     mode === 'escape' ? 'text-emerald-400' : (cspEnabled && cspViolation ? 'text-amber-400' : 'text-rose-400')
                   }`}>
                     {mode === 'escape' ? 'Neutralized' : (cspEnabled && cspViolation ? 'Blocked by CSP' : 'Vulnerable!')}
                   </span>
                </div>
             </div>
             {mode === 'danger' && !cspEnabled && (
               <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                 <Bug size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Script Executed</span>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
