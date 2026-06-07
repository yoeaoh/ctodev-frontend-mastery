import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, RotateCcw, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Step {
  id: number;
  description: string;
  highlight: number[];
  callStack: string[];
  microtasks: string[];
  tasks: string[];
  browserApis?: string[];
  output?: string;
  explanation?: string;
}

interface Scenario {
  id: string;
  scenario_title: string;
  code: string;
  steps: Step[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "classic-event-loop-flow",
    scenario_title: "Classic Event Loop Flow",
    code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
    steps: [
      {
        id: 1,
        description: "Execution starts. The first line is synchronous console.log('1'). It hits the Call Stack and executes immediately.",
        highlight: [1],
        callStack: [],
        microtasks: [],
        tasks: [],
        browserApis: [],
        output: "1",
        explanation: "console.log is a built-in function, executed natively. No heap allocations."
      },
      {
        id: 2,
        description: "setTimeout(cb, 0) is called. WebAPI Timer starts. Callback is sent to Web API environment.",
        highlight: [2],
        callStack: [],
        microtasks: [],
        tasks: [],
        browserApis: ["Timer (0ms)"],
        output: "1",
        explanation: "setTimeout does not block. The timer runs in a background thread of the browser."
      },
      {
        id: 3,
        description: "Timer fired (0ms passed). Callback 'console.log(2)' moves from Web API to Task Queue.",
        highlight: [2],
        callStack: [],
        microtasks: [],
        tasks: ["console.log('2')"],
        browserApis: [],
        output: "1",
        explanation: "Callback moves to Task Queue ONLY after timer has fired."
      },
      {
        id: 4,
        description: "Promise.resolve().then(cb) creates a resolved Promise. Callback 'console.log(3)' is added to the Microtask Queue.",
        highlight: [3],
        callStack: [],
        microtasks: ["console.log('3')"],
        tasks: ["console.log('2')"],
        browserApis: [],
        output: "1",
        explanation: "then() registers the callback to be executed as a microtask immediately if the promise is already resolved."
      },
      {
        id: 5,
        description: "Last synchronous line: console.log('4'). Executes in Call Stack. synchronous code is finished. Call Stack is empty!",
        highlight: [4],
        callStack: [],
        microtasks: ["console.log('3')"],
        tasks: ["console.log('2')"],
        browserApis: [],
        output: "1 4",
        explanation: "Checkpoint: Stack is empty. Event Loop wakes up and checks Microtask Queue first."
      },
      {
        id: 6,
        description: "Event Loop drains Microtask Queue. Callback 'console.log(3)' executes. Output: '3'.",
        highlight: [],
        callStack: [],
        microtasks: [],
        tasks: ["console.log('2')"],
        browserApis: [],
        output: "1 4 3",
        explanation: "Microtasks are processed until the queue is empty."
      },
      {
        id: 7,
        description: "Microtask Queue empty. Event Loop takes ONE task from Task Queue — callback 'console.log(2)' executes. Output: '2'.",
        highlight: [],
        callStack: [],
        microtasks: [],
        tasks: [],
        browserApis: [],
        output: "1 4 3 2",
        explanation: "Event Loop takes exactly ONE task per iteration."
      },
      {
        id: 8,
        description: "All queues empty. Event Loop waits for new tasks or performs rendering.",
        highlight: [],
        callStack: [],
        microtasks: [],
        tasks: [],
        browserApis: [],
        output: "1 4 3 2",
        explanation: "Final state. Remember: Sync code -> Microtasks -> One Macrotask."
      }
    ]
  },
  {
    id: "async-await-transformation",
    scenario_title: "Async/Await Transformation",
    code: "async function test() {\n  console.log('A');\n  const res = await fetch('/api');\n  console.log('B');\n}\nconsole.log('C');\ntest();\nconsole.log('D');",
    steps: [
      {
        id: 1,
        description: "Global code starts. console.log('C') prints immediately.",
        highlight: [6],
        callStack: [],
        microtasks: [],
        tasks: [],
        output: "C"
      },
      {
        id: 2,
        description: "test() is called. Synchronous part of function runs: console.log('A') prints. Reach await fetch().",
        highlight: [2, 7],
        callStack: [],
        microtasks: [],
        tasks: [],
        output: "C A",
        explanation: "Async function body runs synchronously until the first await."
      },
      {
        id: 3,
        description: "await suspends test(). Continuation (console.log('B')) is registered as a microtask for when fetch resolves.",
        highlight: [3],
        callStack: [],
        microtasks: ["continuation of test()"],
        tasks: [],
        output: "C A",
        explanation: "Await point is a state boundary. Everything after is essentially a .then() callback."
      },
      {
        id: 4,
        description: "Global code finishes: console.log('D') prints. Call Stack is empty.",
        highlight: [8],
        callStack: [],
        microtasks: ["continuation of test()"],
        tasks: [],
        output: "C A D"
      },
      {
        id: 5,
        description: "Fetch resolves. Microtask Queue has continuation. Event Loop executes it: console.log('B') prints.",
        highlight: [4],
        callStack: [],
        microtasks: [],
        tasks: [],
        output: "C A D B"
      }
    ]
  }
];

export const EventLoopVisualizer: React.FC = () => {
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
    <div className="flex flex-col gap-6 p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-100 w-full max-w-6xl mx-auto shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-indigo-400">Event Loop Explorer</h3>
          <div className="flex gap-2">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => switchScenario(idx)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                  activeScenarioIdx === idx 
                    ? "bg-indigo-600 text-white shadow-lg" 
                    : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                {s.scenario_title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button onClick={reset} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors" title="Reset"><RotateCcw size={18}/></button>
          <button onClick={prev} disabled={currentStep === 0} className="px-3 py-1.5 hover:bg-zinc-800 disabled:opacity-30 rounded-lg text-sm font-medium transition-colors border border-zinc-800">
            <ChevronLeft size={16} className="inline mr-1" /> Back
          </button>
          <button onClick={next} disabled={currentStep === scenario.steps.length - 1} className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-500/20">
            Next <ChevronRight size={16}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Code View */}
        <div className="bg-zinc-950 p-6 rounded-xl font-mono text-sm leading-relaxed border border-zinc-800 flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-[10px] text-zinc-600 uppercase font-bold tracking-[0.2em]">Source Code</div>
            <div className="text-[10px] text-zinc-500 font-mono">Step {currentStep + 1} / {scenario.steps.length}</div>
          </div>
          <div className="flex-grow space-y-1">
            {scenario.code.split('\n').map((line, i) => (
              <div key={i} className={cn(
                "px-3 py-0.5 rounded transition-all duration-300 flex gap-4",
                step.highlight.includes(i + 1) ? "bg-indigo-500/20 text-indigo-100 border-l-2 border-indigo-500" : "opacity-30"
              )}>
                <span className="shrink-0 w-4 text-zinc-700 text-right select-none">{i + 1}</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </div>
          
          {/* Output Display */}
          <div className="mt-6 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
             <div className="text-[9px] uppercase font-bold text-zinc-600 mb-2">Console Output</div>
             <div className="font-mono text-xs text-emerald-500 h-6">
               {step.output ? `> ${step.output}` : '> _'}
             </div>
          </div>

          <div className="mt-4 p-4 bg-indigo-500/5 rounded-lg border border-indigo-500/20 text-xs text-zinc-400 leading-relaxed italic flex items-start gap-3">
             <div className="p-1.5 bg-indigo-500/10 rounded text-indigo-400 mt-0.5">
               <SkipForward size={14} />
             </div>
             {step.description}
          </div>
        </div>

        {/* Visualizer Areas */}
        <div className="grid grid-cols-2 gap-4">
          <QueueArea title="Call Stack" items={step.callStack || []} color="bg-rose-500/10 text-rose-300 border-rose-500/20" reversed />
          <QueueArea title="Web APIs" items={step.browserApis || []} color="bg-emerald-500/10 text-emerald-300 border-emerald-500/20" />
          <QueueArea title="Microtask Queue" items={step.microtasks || []} color="bg-amber-500/10 text-amber-300 border-amber-500/20" />
          <QueueArea title="Task Queue" items={step.tasks || []} color="bg-indigo-500/10 text-indigo-300 border-indigo-500/20" />
          
          {step.explanation && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="col-span-2 p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl mt-4"
             >
               <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-2 flex items-center gap-2">
                 <Play size={10} fill="currentColor" /> Senior Insight
               </h4>
               <p className="text-xs text-zinc-300 leading-relaxed">{step.explanation}</p>
             </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

interface QueueAreaProps {
  title: string;
  items: string[];
  color: string;
  reversed?: boolean;
}

const QueueArea: React.FC<QueueAreaProps> = ({ title, items, color, reversed = false }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest px-1">{title}</div>
      <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl h-40 flex flex-col p-3 gap-2 overflow-hidden relative shadow-inner">
        <AnimatePresence initial={false} mode="popLayout">
          {(reversed ? [...items].reverse() : items).map((item, idx) => (
            <motion.div
              key={item + idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={cn("px-3 py-2 text-[11px] font-mono rounded-lg border shadow-sm truncate", color)}
            >
              {item}
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 text-center p-4">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Empty / Ready</span>
          </div>
        )}
      </div>
    </div>
  );
}
