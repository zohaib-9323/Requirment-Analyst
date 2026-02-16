"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Check } from "lucide-react";

const ANALYSIS_STEPS = [
  { label: "Parsing requirements", duration: 2000 },
  { label: "Scanning for missing requirements", duration: 3500 },
  { label: "Identifying ambiguities", duration: 3000 },
  { label: "Discovering edge cases", duration: 3500 },
  { label: "Formulating technical questions", duration: 3000 },
  { label: "Analyzing business logic", duration: 3500 },
  { label: "Generating report", duration: 2000 },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cumulative = 0;
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      cumulative += ANALYSIS_STEPS[i].duration;
      if (elapsed < cumulative) {
        setCurrentStep(i);
        return;
      }
    }
    setCurrentStep(ANALYSIS_STEPS.length - 1);
  }, [elapsed]);

  return (
    <div className="glass p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4"
        >
          <Brain className="w-7 h-7 text-indigo-400" />
        </motion.div>
        <h2 className="text-lg font-bold text-white">
          Analyzing Requirements
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Gemini AI is reviewing as a senior architect...
        </p>

        {/* Progress bar */}
        <div className="mt-5 w-full max-w-xs mx-auto">
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
              }}
              initial={{ width: "0%" }}
              animate={{
                width: `${Math.min(
                  ((currentStep + 1) / ANALYSIS_STEPS.length) * 100,
                  95
                )}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {ANALYSIS_STEPS.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-indigo-500/[0.06] border border-indigo-500/10"
                  : isCompleted
                  ? "opacity-50"
                  : "opacity-25"
              }`}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : isActive ? (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        className="w-1 h-1 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: d * 0.2,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                )}
              </div>

              <span
                className={`text-sm ${
                  isActive
                    ? "text-gray-200 font-medium"
                    : isCompleted
                    ? "text-gray-500"
                    : "text-gray-700"
                }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Time */}
      <div className="text-center mt-6">
        <span className="text-[11px] text-gray-700 font-mono">
          {(elapsed / 1000).toFixed(1)}s elapsed
        </span>
      </div>
    </div>
  );
}
