"use client";

import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, ArrowRight } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const isRateLimit = message.toLowerCase().includes("429") || message.toLowerCase().includes("quota");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass border-red-500/10 max-w-2xl mx-auto overflow-hidden"
    >
      {/* Red accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-red-500/40 via-red-500/20 to-transparent" />

      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-red-400">
              Analysis Failed
            </h3>
            <p className="text-[13px] text-gray-400 mt-1.5 leading-relaxed break-words">
              {message}
            </p>

            {isRateLimit && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/[0.05] border border-amber-500/10">
                <p className="text-[12px] text-amber-400/80 leading-relaxed">
                  This is a rate limit error from the Gemini API free tier. Wait about 30 seconds and try again, or upgrade your API plan for higher limits.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2.5 mt-4">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="btn-secondary !text-xs !text-red-400 hover:!text-red-300 !border-red-500/20 hover:!bg-red-500/10"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
