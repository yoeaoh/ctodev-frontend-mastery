import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Server, Database, Zap, Layers, 
  Activity, Shield, Share2, Trash2, CheckCircle2, 
  AlertCircle, Info, Plus, MousePointer2 
} from 'lucide-react';

type ComponentType = 'browser' | 'cdn' | 'lb' | 'gateway' | 'service' | 'cache' | 'db' | 'ws';

interface CanvasComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label: string;
}

interface Connection {
  from: string;
  to: string;
}

const COMPONENT_METADATA: Record<ComponentType, { icon: any, color: string, defaultLabel: string }> = {
  browser: { icon: Globe, color: 'text-blue-400', defaultLabel: 'Browser' },
  cdn: { icon: Zap, color: 'text-yellow-400', defaultLabel: 'CDN (Edge)' },
  lb: { icon: Activity, color: 'text-emerald-400', defaultLabel: 'Load Balancer' },
  gateway: { icon: Shield, color: 'text-purple-400', defaultLabel: 'API Gateway' },
  service: { icon: Server, color: 'text-indigo-400', defaultLabel: 'Microservice' },
  cache: { icon: Zap, color: 'text-orange-400', defaultLabel: 'Redis Cache' },
  db: { icon: Database, color: 'text-rose-400', defaultLabel: 'PostgreSQL' },
  ws: { icon: Share2, color: 'text-cyan-400', defaultLabel: 'WebSocket Srv' }
};

export const SystemDesignCanvas: React.FC = () => {
  const [components, setComponents] = useState<CanvasComponent[]>([
    { id: 'start-node', type: 'browser', x: 50, y: 150, label: 'Client' }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addComponent = (type: ComponentType) => {
    const newComp: CanvasComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      label: COMPONENT_METADATA[type].defaultLabel
    };
    setComponents([...components, newComp]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    setConnections(connections.filter(conn => conn.from !== id && conn.to !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const startConnection = (id: string) => {
    setIsConnecting(id);
  };

  const endConnection = (id: string) => {
    if (isConnecting && isConnecting !== id) {
      // Avoid duplicates
      if (!connections.some(c => c.from === isConnecting && c.to === id)) {
        setConnections([...connections, { from: isConnecting, to: id }]);
      }
    }
    setIsConnecting(null);
  };

  const updatePosition = (id: string, x: number, y: number) => {
    setComponents(components.map(c => c.id === id ? { ...c, x, y } : c));
  };

  // Evaluation Logic
  const evaluateDesign = () => {
    const hasCDN = components.some(c => c.type === 'cdn');
    const hasLB = components.some(c => c.type === 'lb');
    const hasCache = components.some(c => c.type === 'cache');
    const hasGateway = components.some(c => c.type === 'gateway');
    const hasWS = components.some(c => c.type === 'ws');
    const serviceCount = components.filter(c => c.type === 'service').length;

    let score = 20; // Base score
    const details = [];

    if (hasCDN) { score += 15; details.push("✅ CDN reduces TTFB for static assets."); }
    else { details.push("⚠️ Missing CDN: Latency will be high for global users."); }

    if (hasLB) { score += 15; details.push("✅ Load Balancer enables horizontal scaling."); }
    else { details.push("❌ No Load Balancer: Single point of failure."); }

    if (hasCache) { score += 10; details.push("✅ Redis caching reduces DB load."); }
    if (hasGateway) { score += 10; details.push("✅ API Gateway handles Auth & Rate Limiting."); }
    if (serviceCount > 1) { score += 15; details.push("✅ Microservices architecture (Service-oriented)."); }
    if (hasWS) { score += 15; details.push("✅ WebSocket support for real-time features."); }

    return { score, details };
  };

  const evaluation = evaluateDesign();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Toolbar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
             <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Plus size={16} className="text-indigo-500" />
                Architecture Blocks
             </h4>
             <div className="grid grid-cols-2 gap-3">
                {(Object.keys(COMPONENT_METADATA) as ComponentType[]).map(type => {
                  const Meta = COMPONENT_METADATA[type];
                  return (
                    <button
                      key={type}
                      onClick={() => addComponent(type)}
                      className="flex flex-col items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all group"
                    >
                      <Meta.icon size={20} className={`${Meta.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 capitalize">{type}</span>
                    </button>
                  );
                })}
             </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
             <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Architecture Score</h4>
             <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-black text-indigo-400">{evaluation.score}</div>
                <div className="text-[10px] font-bold text-zinc-600 uppercase">Seniority<br/>Index</div>
             </div>
             <div className="space-y-2">
                {evaluation.details.map((d, i) => (
                  <div key={i} className="text-[10px] text-zinc-500 flex gap-2">
                     <span className="shrink-0">•</span>
                     <span>{d}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3 h-[600px] bg-zinc-950 border-2 border-zinc-900 rounded-3xl relative overflow-hidden cursor-crosshair group">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#18181b_1px,_transparent_1px)] bg-[size:40px_40px] opacity-20" />
           
           <svg className="absolute inset-0 pointer-events-none w-full h-full">
              <defs>
                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3f3f46" />
                 </marker>
              </defs>
              {connections.map((conn, i) => {
                const from = components.find(c => c.id === conn.from);
                const to = components.find(c => c.id === conn.to);
                if (!from || !to) return null;
                return (
                  <motion.line
                    key={i}
                    x1={from.x + 32}
                    y1={from.y + 32}
                    x2={to.x + 32}
                    y2={to.y + 32}
                    stroke="#3f3f46"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                  />
                );
              })}
              {isConnecting && (
                <line 
                  x1={components.find(c => c.id === isConnecting)!.x + 32}
                  y1={components.find(c => c.id === isConnecting)!.y + 32}
                  x2={components.find(c => c.id === isConnecting)!.x + 32} // Fallback
                  y2={components.find(c => c.id === isConnecting)!.y + 32} // Updated by mouse usually but omitted for simplicity
                  stroke="#6366f1"
                  strokeDasharray="4 4"
                />
              )}
           </svg>

           {components.map(comp => {
             const Meta = COMPONENT_METADATA[comp.type];
             return (
               <motion.div
                 key={comp.id}
                 drag
                 dragMomentum={false}
                 onDrag={(_, info) => updatePosition(comp.id, comp.x + info.delta.x, comp.y + info.delta.y)}
                 style={{ x: comp.x, y: comp.y }}
                 className={`absolute w-16 h-16 rounded-2xl border-2 flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors ${
                   selectedId === comp.id ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-zinc-900 border-zinc-800'
                 } ${isConnecting === comp.id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950' : ''}`}
                 onClick={(e) => {
                   e.stopPropagation();
                   if (isConnecting) {
                     endConnection(comp.id);
                   } else {
                     setSelectedId(comp.id);
                   }
                 }}
               >
                  <Meta.icon size={24} className={Meta.color} />
                  
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black uppercase text-zinc-600 tracking-widest">
                     {comp.label}
                  </div>

                  <AnimatePresence>
                    {selectedId === comp.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1"
                      >
                         <button 
                           onClick={(e) => { e.stopPropagation(); startConnection(comp.id); }}
                           className="p-1.5 bg-zinc-800 hover:bg-indigo-600 rounded-lg text-white transition-colors"
                           title="Connect"
                         >
                           <Share2 size={12} />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); removeComponent(comp.id); }}
                           className="p-1.5 bg-zinc-800 hover:bg-rose-600 rounded-lg text-white transition-colors"
                           title="Delete"
                         >
                           <Trash2 size={12} />
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
             );
           })}

           <div className="absolute bottom-6 right-8 flex items-center gap-4 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-bold text-zinc-500">
              <div className="flex items-center gap-1.5">
                 <MousePointer2 size={12} /> Select / Move
              </div>
              <div className="w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                 <Share2 size={12} /> Connect Nodes
              </div>
           </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex items-start gap-6">
         <div className="p-4 bg-indigo-500/10 rounded-2xl">
            <Info className="text-indigo-400" size={24} />
         </div>
         <div>
            <h5 className="text-sm font-bold text-zinc-200 mb-2 uppercase tracking-widest">System Design Rubric</h5>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-4xl">
               In a Senior-level interview, picking the right component is only 20% of the task. The rest is justifying the <strong>Trade-offs</strong>. 
               Why choose a Load Balancer over simple Round Robin? Why a Cache for non-static data? 
               Your architecture score reflects how well your design handles <strong>Scalability</strong> and <strong>Availability</strong>.
            </p>
         </div>
      </div>
    </div>
  );
};
