import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CodeLine {
  code: string;
  explanation: string;
}

interface CodeExplainerProps {
  lines: CodeLine[];
  title?: string;
  className?: string;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({ lines, title, className }) => {
  const [activeLine, setActiveLine] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden", className)}>
      {/* Code Side */}
      <div className="p-6 bg-zinc-900/50 border-r border-zinc-800 font-mono text-sm leading-relaxed overflow-x-auto">
        {title && <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</div>}
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={cn(
                "group relative px-2 -mx-2 rounded cursor-pointer transition-all duration-200",
                activeLine === idx ? "bg-indigo-500/20 text-indigo-100" : "hover:bg-zinc-800 text-zinc-400"
              )}
              onMouseEnter={() => setActiveLine(idx)}
              onMouseLeave={() => setActiveLine(null)}
            >
              <div className="flex gap-4">
                <span className="shrink-0 w-6 text-zinc-600 text-right select-none">{idx + 1}</span>
                <span className="whitespace-pre">{line.code}</span>
              </div>
              {activeLine === idx && (
                <motion.div
                  layoutId="active-line-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Side */}
      <div className="p-6 bg-zinc-950 flex flex-col justify-center min-h-[200px]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Deep Dive</h4>
          </div>
          <div className="min-h-[100px] flex items-center">
            {activeLine !== null ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-zinc-100 text-lg font-medium leading-snug">
                  {lines[activeLine].explanation}
                </p>
                <div className="h-px w-12 bg-zinc-800" />
                <p className="text-zinc-500 text-sm">
                  Line {activeLine + 1}: {lines[activeLine].code.trim()}
                </p>
              </motion.div>
            ) : (
              <p className="text-zinc-500 italic">Hover over a line of code to see the deep dive explanation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
