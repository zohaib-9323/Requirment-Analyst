"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import Header, { Logo } from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RequirementForm from "@/components/RequirementForm";
import WhatYouGet from "@/components/WhatYouGet";
import AnalysisResult from "@/components/AnalysisResult";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";
import { AnalysisResult as AnalysisResultType } from "@/types";

type Status = "idle" | "loading" | "done";

async function readError(response: Response) {
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    if (data.message) return data.message as string;
  } catch {
    // Not JSON; fall through to the raw text.
  }
  return text || `Server error: ${response.status} ${response.statusText}`;
}

export default function Home() {
  const [requirements, setRequirements] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = useCallback(async () => {
    const text = requirements.trim();
    const controller = new AbortController();
    abortRef.current = controller;

    setSubmitted(text);
    setError(null);
    setResult(null);
    setStatus("loading");
    window.scrollTo({ top: 0 });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: text }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(await readError(response));

      const data = await response.json();
      setResult(data.analysis);
      setStatus("done");
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("idle");
    }
    window.scrollTo({ top: 0 });
  }, [requirements]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const startOver = useCallback(() => {
    setResult(null);
    setError(null);
    setStatus("idle");
    window.scrollTo({ top: 0 });
  }, []);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.25 },
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-screen flex-col">
        <div aria-hidden className="backdrop-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]" />

        <Header onNew={status === "done" ? startOver : undefined} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div key="input" {...fade}>
                <div className="mx-auto max-w-3xl">
                  <HeroSection />
                  {error && (
                    <ErrorMessage
                      message={error}
                      onRetry={analyze}
                      onDismiss={() => setError(null)}
                    />
                  )}
                  <RequirementForm
                    value={requirements}
                    onChange={setRequirements}
                    onSubmit={analyze}
                  />
                </div>
                <WhatYouGet />
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div key="loading" {...fade}>
                <LoadingState requirements={submitted} onCancel={cancel} />
              </motion.div>
            )}

            {status === "done" && result && (
              <motion.div key="result" {...fade}>
                <AnalysisResult result={result} requirements={submitted} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-subtle sm:flex-row sm:px-6">
            <span className="flex items-center gap-2.5">
              <span className="scale-75">
                <Logo />
              </span>
              Requirement Analyst
            </span>
            <p className="text-center sm:text-right">
              AI suggestions can be wrong — always review findings with your team.
            </p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
