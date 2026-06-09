import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stepper } from '../ui/Stepper';
import { CodeExplainer } from '../ui/CodeExplainer';
import { Cpu, Zap, Activity, AlertTriangle, Search, FileCode } from 'lucide-react';

const PIPELINE_DATA = [
  {
    id: 1,
    phase: "Parsing",
    description: "Функция add() парсится. На первом проходе — lazy (preparse): V8 проверяет синтаксис, создаёт ScopeInfo, но НЕ создаёт AST. Полный парсинг произойдёт только при вызове.",
    engineState: { stage: "Parser", output: "ScopeInfo + FunctionLiteral (preparse)", format: "Lazy (preparse mode)" },
    duration: "~0.01ms",
    icon: <Search className="text-blue-400" size={24} />,
    color: "bg-blue-500/10 border-blue-500/50"
  },
  {
    id: 2,
    phase: "Ignition Bytecode",
    description: "add() вызвана первый раз. Полный парсинг → AST → Ignition генерирует байткод. 8-bit инструкции: Ldar a1, Add r0, Return. Байткод кэшируется.",
    engineState: { stage: "Ignition", output: "Bytecode Array (4 instructions)", format: "8-bit bytecode" },
    duration: "~0.1ms",
    icon: <FileCode className="text-yellow-400" size={24} />,
    color: "bg-yellow-500/10 border-yellow-500/50"
  },
  {
    id: 3,
    phase: "Hot Threshold (30+ calls)",
    description: "add() вызвана 30 раз. V8 видит: тип аргументов стабильный (Smi, Smi). Feedback vector: [Smi, Smi]. TurboFan получает сигнал: 'стоит оптимизировать'.",
    engineState: { stage: "Feedback Collection", output: "Feedback Vector: [Smi, Smi]", format: "Monomorphic (Smi)" },
    duration: "~0.001ms each",
    icon: <Activity className="text-orange-400" size={24} />,
    color: "bg-orange-500/10 border-orange-500/50"
  },
  {
    id: 4,
    phase: "TurboFan Optimization",
    description: "TurboFan строит Sea of Nodes: SSA-граф. Lowering: SmiAdd → inline int addition. Генерирует машинный код: mov eax, [a]; add eax, [b]; ret.",
    engineState: { stage: "TurboFan", output: "Optimized machine code (Smi-optimized)", format: "Native x64 instructions" },
    duration: "~1-5ms",
    icon: <Zap className="text-indigo-400" size={24} />,
    color: "bg-indigo-500/10 border-indigo-500/50"
  },
  {
    id: 5,
    phase: "Optimized Execution",
    description: "add(i, i*2) вызывается 20 раз (всего 50). Каждый вызов — машинный код, без проверки типов. Сложность: 2-3 инструкции процессора.",
    engineState: { stage: "Native Code", output: "Direct register addition (no call overhead)", format: "Monomorphic, inlined" },
    duration: "~0.001ms per call",
    icon: <Cpu className="text-emerald-400" size={24} />,
    color: "bg-emerald-500/10 border-emerald-500/50"
  },
  {
    id: 6,
    phase: "⚠️ DEOPTIMIZATION",
    description: "add('hello', ' world') — строка! V8 пытается выполнить оптимизированный код, но SmiAdd не работает со строками → Bailout! TurboFan код выбрасывается, возвращаемся к Ignition.",
    engineState: { stage: "Bailout", output: "Deoptimization → Ignition bytecode", format: "Back to bytecode (slow path)" },
    duration: "~1-2ms (bailout)",
    icon: <AlertTriangle className="text-red-400" size={24} />,
    color: "bg-red-500/10 border-red-500/50"
  }
];

export const V8CompilationPipeline: React.FC = () => {
  const steps = PIPELINE_DATA.map((step) => ({
    title: step.phase,
    description: step.duration,
    content: (
      <div className="flex flex-col gap-6 w-full h-full max-w-2xl mx-auto">
        <div className={`p-6 rounded-xl border ${step.color} transition-colors duration-500`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 shadow-xl">
              {step.icon}
            </div>
            <div>
              <h4 className="text-xl font-bold text-zinc-100">{step.phase}</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Engine Stage</span>
              <div className="text-indigo-400 font-mono text-sm mt-1">{step.engineState.stage}</div>
            </div>
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Format</span>
              <div className="text-emerald-400 font-mono text-sm mt-1">{step.engineState.format}</div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Output</span>
            <div className="text-zinc-300 font-mono text-xs mt-2 break-all whitespace-pre-wrap leading-relaxed bg-zinc-900/50 p-2 rounded border border-zinc-800">
              {step.engineState.output}
            </div>
          </div>
        </div>

        {/* Visual Pipeline indicator */}
        <div className="relative h-2 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            initial={{ width: "0%" }}
            animate={{ width: `${(step.id / PIPELINE_DATA.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
      </div>
    )
  }));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <Cpu className="text-indigo-500" />
          V8 Compilation Pipeline
        </h3>
        <Stepper steps={steps} className="min-h-[500px]" />
      </section>

      <section>
        <h4 className="text-lg font-semibold text-zinc-100 mb-4">Inside the Deoptimization Bailout</h4>
        <CodeExplainer
          title="Deoptimization Case Study"
          lines={[
            { code: "function add(a, b) {", explanation: "Parser creates AST, Ignition creates Bytecode." },
            { code: "  return a + b;", explanation: "TurboFan optimizes this for Smi (Small Integers) after 50 calls." },
            { code: "}", explanation: "" },
            { code: "", explanation: "" },
            { code: "add(1, 2); // Monomorphic (Smi)", explanation: "Fastest path: optimized machine code execution." },
            { code: "add('hello', ' '); // ❌ Bailout!", explanation: "Types changed! TurboFan code is invalid for strings. V8 halts, restores stack, and falls back to Bytecode." },
          ]}
        />
      </section>
    </div>
  );
};
