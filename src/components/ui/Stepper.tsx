import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Step {
  title: string;
  description: string;
  content: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, className }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  return (
    <div className={cn("flex flex-col gap-6 p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{steps[currentStep].title}</h3>
          <p className="text-sm text-zinc-400">{steps[currentStep].description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={reset}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center mt-auto">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <div className="flex gap-1">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1 w-6 rounded-full transition-colors",
                idx === currentStep ? "bg-indigo-500" : "bg-zinc-800"
              )}
            />
          ))}
        </div>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
