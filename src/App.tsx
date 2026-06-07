import React from 'react';
import { Stepper } from './components/ui/Stepper';
import { CodeExplainer } from './components/ui/CodeExplainer';
import { Layout, Code2, Layers, Cpu } from 'lucide-react';

function App() {
  const eventLoopSteps = [
    {
      title: "Call Stack",
      description: "Synchronous tasks are pushed and popped here.",
      content: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-12 bg-indigo-500/20 border border-indigo-500 rounded flex items-center justify-center text-indigo-100 font-mono">
            console.log('Start')
          </div>
          <div className="w-48 h-48 border-2 border-dashed border-zinc-700 rounded-lg flex items-end p-2">
            <div className="w-full bg-indigo-500 h-10 rounded animate-pulse" />
          </div>
        </div>
      )
    },
    {
      title: "Web APIs",
      description: "Asynchronous tasks like setTimeout move here.",
      content: (
        <div className="flex gap-8 items-center">
          <div className="w-32 h-32 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-500 italic">
            Call Stack
          </div>
          <div className="text-4xl text-zinc-700">→</div>
          <div className="w-32 h-32 bg-amber-500/20 border border-amber-500 rounded-lg flex items-center justify-center text-amber-100 text-center text-xs p-2">
            Timer API (1000ms)
          </div>
        </div>
      )
    }
  ];

  const codeSnippet = [
    {
      code: "console.log('First');",
      explanation: "Initial synchronous call. Goes straight to the Call Stack."
    },
    {
      code: "setTimeout(() => console.log('Second'), 0);",
      explanation: "Asynchronous call. The callback is registered with Web APIs, not executed immediately."
    },
    {
      code: "Promise.resolve().then(() => console.log('Third'));",
      explanation: "Microtask. Will be added to the Microtask Queue and executed after the current script."
    },
    {
      code: "console.log('Fourth');",
      explanation: "Last synchronous call in the current task."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <header className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Code2 size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Frontend Mastery <span className="text-indigo-500">Interactive</span></h1>
        </div>
        <p className="text-zinc-400 max-w-2xl text-lg">
          Master the internals of web development through interactive visualizations and deep-dive code analysis.
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-16">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Layers className="text-indigo-500" size={20} />
            <h2 className="text-xl font-semibold">Interactive Visualizations</h2>
          </div>
          <Stepper steps={eventLoopSteps} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="text-indigo-500" size={20} />
            <h2 className="text-xl font-semibold">Line-by-Line Deep Dive</h2>
          </div>
          <CodeExplainer lines={codeSnippet} title="event-loop-demo.js" />
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-24 pt-8 border-t border-zinc-900 text-zinc-600 text-sm flex justify-between">
        <p>© 2026 Frontend Mastery Interactive</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-zinc-400 transition-colors">Curriculum</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Internal Mechanics</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Advanced Patterns</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
