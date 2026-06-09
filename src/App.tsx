import React, { useState } from 'react';
import { Code2, Monitor, Zap, ChevronRight, BookOpen, Layers, Cpu, Shield, BarChart3, Globe, Box, Info, Database } from 'lucide-react';
import { modules, Module } from './data/curriculum';
import { EventLoopVisualizer } from './components/visualizations/EventLoopVisualizer';
import { PixelPipelineSimulator } from './components/visualizations/PixelPipelineSimulator';
import { LayoutThrashLab } from './components/visualizations/LayoutThrashLab';
import { VDOMDiffVisualizer } from './components/visualizations/VDOMDiffVisualizer';
import { V8CompilationPipeline } from './components/visualizations/V8CompilationPipeline';
import { HiddenClassTransitions } from './components/visualizations/HiddenClassTransitions';
import { MemoryLeakDebugger } from './components/visualizations/MemoryLeakDebugger';
import { CodeExplainer } from './components/ui/CodeExplainer';

function App() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'internals'>('roadmap');

  const vdomCode = [
    {
      code: "function h(type, props, ...children) {",
      explanation: "type: string ('div') -> DOM tag. Function/class -> component. symbol -> fragment. This is the first thing diff checks."
    },
    {
      code: "  return {",
      explanation: "Returns a VNode object. In React, this has $$typeof: Symbol.for('react.element') for security."
    },
    {
      code: "    type,",
      explanation: "The tag name or component reference."
    },
    {
      code: "    props: props || null,",
      explanation: "Attributes and listeners. shallowCompare(oldProps, newProps) is used in diff."
    },
    {
      code: "    children: children.flat(Infinity),",
      explanation: "React flattens children to handle arrays from .map() calls correctly."
    },
    {
      code: "    key: props?.key ?? null,",
      explanation: "Stable identity anchor. Without this, React uses index, which can cause state bugs."
    },
    {
      code: "    ref: props?.ref ?? null",
      explanation: "Direct reference to the real DOM node."
    },
    {
      code: "  };",
      explanation: "Ending VNode object."
    },
    {
      code: "}",
      explanation: "Ending h function."
    }
  ];

  const getModuleIcon = (id: number) => {
    switch (id) {
      case 1: return <Zap className="text-yellow-500" />;
      case 2: return <Box className="text-blue-500" />;
      case 3: return <Monitor className="text-green-500" />;
      case 4: return <Cpu className="text-purple-500" />;
      case 5: return <Layers className="text-indigo-500" />;
      case 6: return <BarChart3 className="text-pink-500" />;
      case 7: return <Globe className="text-cyan-500" />;
      case 8: return <Shield className="text-red-500" />;
      default: return <BookOpen />;
    }
  };

  const handleExploreModule = (module: Module) => {
    if ([1, 2, 3, 4].includes(module.id)) {
      setActiveTab('internals');
      // Scroll to the specific module section
      setTimeout(() => {
        const element = document.getElementById(`module-${module.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('roadmap')}>
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg">Frontend Mastery</span>
          </div>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 shadow-inner">
            <button 
              onClick={() => setActiveTab('roadmap')}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'roadmap' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Curriculum
            </button>
            <button 
              onClick={() => setActiveTab('internals')}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'internals' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Interactive Labs
            </button>
          </div>
        </div>
      </nav>

      <div className="p-8">
        {activeTab === 'roadmap' ? (
          <>
            <header className="max-w-6xl mx-auto mb-20 text-center pt-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Zap size={12} /> The Path to Senior
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                Master the Web's <br />Internal Mechanics.
              </h1>
              <p className="text-zinc-400 max-w-2xl mx-auto text-xl leading-relaxed">
                The interactive technical guide for Senior Frontend Engineers. Stop guessing how your code runs and start visualizing it.
              </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
              {modules.map((module) => (
                <div 
                  key={module.id}
                  onClick={() => handleExploreModule(module)}
                  className="group p-8 bg-zinc-900 border border-zinc-800 rounded-3xl hover:border-indigo-500/50 transition-all hover:shadow-[0_0_50px_rgba(99,102,241,0.1)] relative overflow-hidden cursor-pointer flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover:border-indigo-500/30 transition-colors shadow-inner">
                      {getModuleIcon(module.id)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${module.tier === 'Premium' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {module.tier}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{module.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-8 flex-grow">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50 mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Estimated</span>
                      <span className="text-xs font-mono text-zinc-400">{module.estimatedHours} Hours</span>
                    </div>
                    <button className="flex items-center gap-1.5 text-indigo-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                      { [1, 2, 3, 4].includes(module.id) ? 'Open Lab' : 'Coming Soon' } <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </main>
          </>
        ) : (
          <main className="max-w-6xl mx-auto space-y-40 py-12 pb-32">
            {/* Module 1: Event Loop */}
            <section id="module-1" className="scroll-mt-24">
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-[0.2em]">
                  <Zap size={14} /> Module 01
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-5xl font-black tracking-tight mb-4">The Event Loop</h2>
                    <p className="text-zinc-500 max-w-2xl leading-relaxed text-lg">
                      Trace how the browser handles asynchronous tasks. Master the priority of <span className="text-indigo-400 font-semibold underline decoration-indigo-400/30">Microtasks</span> vs <span className="text-indigo-400 font-semibold underline decoration-indigo-400/30">Macrotasks</span>.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-500">
                    <Info size={14} /> Interactive Step-through
                  </div>
                </div>
              </div>
              <EventLoopVisualizer />
            </section>

            {/* Module 2: VDOM */}
            <section id="module-2" className="scroll-mt-24">
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">
                  <Box size={14} /> Module 02
                </div>
                <h2 className="text-5xl font-black tracking-tight mb-4">Reconciliation & Diffing</h2>
                <p className="text-zinc-500 max-w-2xl leading-relaxed text-lg">
                  Virtual DOM is a data structure, not a magic trick. See exactly how React identifies what needs to change in the real DOM.
                </p>
              </div>
              
              <div className="space-y-12">
                <VDOMDiffVisualizer />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                   <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
                      <h4 className="text-lg font-bold mb-4 text-indigo-400 uppercase tracking-tight flex items-center gap-2">
                        <Database size={16} /> Under the Hood: VNodes
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        In V8, VNodes are allocated in the <strong>New Space</strong> (Young Generation). 
                        React creates millions of these POJOs during a typical session.
                      </p>
                      <CodeExplainer lines={vdomCode} title="vnode_factory.ts" />
                   </div>
                   <div className="space-y-6">
                      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
                        <h4 className="text-lg font-bold mb-4">Senior Deep Dive</h4>
                        <ul className="space-y-4">
                           {[
                             { title: "Heuristic O(n)", text: "React doesn't find the 'perfect' diff (O(n³)). It assumes different tags mean different trees." },
                             { title: "Key Stability", text: "Keys aren't just for performance; they are identity anchors that preserve component state." },
                             { title: "Fiber Units", text: "Modern React (16+) breaks this diffing into small chunks of work that can be paused." }
                           ].map((item, i) => (
                             <li key={i} className="flex gap-4">
                               <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                                 {i + 1}
                               </div>
                               <div>
                                 <span className="block font-bold text-sm text-zinc-200">{item.title}</span>
                                 <span className="text-xs text-zinc-500">{item.text}</span>
                               </div>
                             </li>
                           ))}
                        </ul>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Module 3: Rendering */}
            <section id="module-3" className="scroll-mt-24">
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-[0.2em]">
                  <Monitor size={14} /> Module 03
                </div>
                <h2 className="text-5xl font-black tracking-tight mb-4">The Pixel Pipeline</h2>
                <p className="text-zinc-500 max-w-2xl leading-relaxed text-lg">
                  Visualize how CSS properties trigger different stages of the browser's rendering engine. Optimize for the Compositor thread.
                </p>
              </div>
              
              <div className="space-y-20">
                <PixelPipelineSimulator />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                   <div className="space-y-8">
                      <div className="flex flex-col gap-4">
                        <h3 className="text-3xl font-bold tracking-tight">Layout Thrashing</h3>
                        <p className="text-zinc-500 leading-relaxed">
                          Forced Synchronous Layout happens when you ask for geometric properties (like <code className="text-indigo-400 bg-indigo-400/10 px-1 rounded">offsetHeight</code>) immediately after changing styles. This forces the browser to halt execution and recalculate the layout.
                        </p>
                      </div>
                      <LayoutThrashLab />
                   </div>
                   
                   <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl self-stretch">
                      <h4 className="text-lg font-bold mb-4 text-emerald-400 uppercase tracking-tight flex items-center gap-2">
                        <Monitor size={16} /> Rendering Optimization
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        The key to 60fps is staying on the <strong>Compositor thread</strong>. Animating <code className="text-zinc-300">transform</code> and <code className="text-zinc-300">opacity</code> avoids the Layout and Paint stages entirely.
                      </p>
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Rule of Thumb</span>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Always <strong>Batch Reads</strong> (measurements) and <strong>Batch Writes</strong> (style changes). Use <code className="text-indigo-400">requestAnimationFrame</code> to align with the display refresh rate.
                          </p>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Compositor-only</span>
                          <div className="flex flex-wrap gap-2">
                            {['transform', 'opacity', 'will-change', 'filter (sometimes)'].map(prop => (
                              <span key={prop} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-[10px] font-mono">
                                {prop}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            {/* Module 4: Memory */}
            <section id="module-4" className="scroll-mt-24">
              <div className="flex flex-col gap-2 mb-12">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-[0.2em]">
                  <Cpu size={14} /> Module 04
                </div>
                <h2 className="text-5xl font-black tracking-tight mb-4">V8 Engine & Memory</h2>
                <p className="text-zinc-500 max-w-2xl leading-relaxed text-lg">
                  Explore how V8 optimizes your JavaScript. From <strong>JIT Compilation</strong> to <strong>Hidden Classes</strong> and advanced <strong>Garbage Collection</strong>.
                </p>
              </div>
              
              <div className="space-y-32">
                <V8CompilationPipeline />

                <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-3xl font-bold tracking-tight">Hidden Class Transitions</h3>
                      <p className="text-zinc-500 leading-relaxed max-w-3xl">
                        V8 uses "Shapes" or "Maps" to optimize object property access. Adding properties in different orders or using <code className="text-rose-400 bg-rose-400/10 px-1 rounded">delete</code> can trigger expensive transitions to <strong>Dictionary Mode</strong>.
                      </p>
                    </div>
                    <HiddenClassTransitions />
                  </div>

                  <div className="space-y-8">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-3xl font-bold tracking-tight">Memory Leak Debugger</h3>
                      <p className="text-zinc-500 leading-relaxed max-w-3xl">
                        Identify patterns that prevent the GC from reclaiming memory. Scan snippets for closures, detached DOM nodes, and forgotten timers to see their impact on the heap.
                      </p>
                    </div>
                    <MemoryLeakDebugger />
                  </div>
                </div>
              </div>
            </section>
          </main>
        )}

        <footer className="max-w-6xl mx-auto border-t border-zinc-900 pt-16 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-800 rounded-lg">
                  <Code2 size={18} className="text-zinc-400" />
                </div>
                <span className="font-bold text-zinc-200 text-lg">Frontend Mastery</span>
              </div>
              <p className="text-zinc-600 text-sm max-w-xs text-center md:text-left">
                Empowering Senior Engineers with deep technical clarity through interactive visualizations.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-16 gap-y-8">
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Platform</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Curriculum</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Labs</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Company</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">About</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Changelog</a>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Legal</span>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Privacy</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">Terms</a>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600 font-medium">
             <p>© 2026 Frontend Mastery Interactive.</p>
             <div className="flex items-center gap-4">
               <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> System Status: Optimal</span>
               <span className="text-zinc-800">|</span>
               <span>v1.0.5-beta</span>
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
