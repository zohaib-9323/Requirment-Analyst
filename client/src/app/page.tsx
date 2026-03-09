"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RequirementForm from "@/components/RequirementForm";
import AnalysisResult from "@/components/AnalysisResult";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";
import { AnalysisResult as AnalysisResultType } from "@/types";

export default function Home() {
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequirements, setLastRequirements] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = useCallback(async (requirements: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastRequirements(requirements);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements }),
      });

      // Check response status BEFORE parsing JSON
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(text);
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setResult(data.analysis);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastRequirements) {
      handleAnalyze(lastRequirements);
    }
  }, [lastRequirements, handleAnalyze]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setLastRequirements("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-600/[0.07] rounded-full blur-[160px] animate-float" />
        <div
          className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-600/[0.05] rounded-full blur-[140px] animate-float"
          style={{ animationDelay: "-2s" }}
        />
        <div
          className="absolute -bottom-32 left-1/3 w-[400px] h-[400px] bg-violet-600/[0.04] rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "-4s" }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-30" />
        {/* Radial fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06060b]/50 to-[#06060b]" />
      </div>

      <Header />

      <main className="relative max-w-5xl mx-auto px-6">
        {/* ── Hero ── */}
        <AnimatePresence mode="wait">
          {!result && !isLoading && !error && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <HeroSection />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <RequirementForm
                onSubmit={handleAnalyze}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results Area ── */}
        <div ref={resultRef} className="scroll-mt-24">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <LoadingState />
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <ErrorMessage message={error} onRetry={handleRetry} />
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <AnalysisResult result={result} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative border-t border-white/[0.04] mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-gray-600 tracking-wide">
            Built with Next.js, Express & Gemini AI
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-gray-700">
              Requirement Analyst v1.0
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
