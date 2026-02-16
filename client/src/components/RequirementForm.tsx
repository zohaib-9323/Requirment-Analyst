"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Send,
  FileText,
  Sparkles,
  RotateCcw,
  ClipboardPaste,
  Type,
  Hash,
} from "lucide-react";
import { SAMPLE_REQUIREMENT } from "@/lib/constants";

interface RequirementFormProps {
  onSubmit: (requirements: string) => void;
  isLoading: boolean;
}

export default function RequirementForm({
  onSubmit,
  isLoading,
}: RequirementFormProps) {
  const [requirements, setRequirements] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requirements.trim().length >= 20 && !isLoading) {
      onSubmit(requirements.trim());
    }
  };

  const loadSample = () => {
    setRequirements(SAMPLE_REQUIREMENT);
    textareaRef.current?.focus();
  };

  const clearForm = () => {
    setRequirements("");
    textareaRef.current?.focus();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRequirements(text);
    } catch {
      // clipboard not available
    }
  };

  const charCount = requirements.length;
  const wordCount = requirements.trim()
    ? requirements.trim().split(/\s+/).length
    : 0;
  const lineCount = requirements ? requirements.split("\n").length : 0;
  const isValid = requirements.trim().length >= 20;

  return (
    <form onSubmit={handleSubmit} className="pb-16">
      {/* ── Editor Card ── */}
      <div
        className={`glass overflow-hidden transition-all duration-500 ${
          isFocused
            ? "border-indigo-500/20 shadow-[0_0_60px_-12px_rgba(99,102,241,0.15)]"
            : ""
        }`}
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-400">
              requirements.txt
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePaste}
              className="btn-secondary !px-2.5 !py-1.5 !text-[11px] !rounded-lg !border-transparent"
            >
              <ClipboardPaste className="w-3 h-3" />
              <span className="hidden sm:inline">Paste</span>
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="btn-secondary !px-2.5 !py-1.5 !text-[11px] !rounded-lg !border-transparent !text-indigo-400 hover:!text-indigo-300 hover:!bg-indigo-500/10"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Try Sample</span>
            </button>
            {requirements && (
              <button
                type="button"
                onClick={clearForm}
                className="btn-secondary !px-2.5 !py-1.5 !text-[11px] !rounded-lg !border-transparent"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Paste your project requirements here...\n\nFor example:\n\n- Build a user management system with role-based access control\n- Users can sign up via email/OAuth, log in, and manage profiles\n- Admin dashboard for managing users, roles, and permissions\n- System should send email notifications for key events\n- Support password reset and account recovery flows\n- Activity logging and audit trail for compliance`}
            className="w-full min-h-[320px] bg-transparent px-5 py-5 text-[13px] text-gray-200 placeholder-gray-700 focus:outline-none resize-y font-mono leading-[1.8] tracking-wide"
            disabled={isLoading}
            spellCheck={false}
          />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <Type className="w-3 h-3" />
              {wordCount} words
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <Hash className="w-3 h-3" />
              {charCount} chars
            </span>
            <span className="text-[11px] text-gray-700">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
          </div>
          <div>
            {charCount > 0 && !isValid && (
              <span className="text-[11px] text-red-400/70">
                Min 20 characters required
              </span>
            )}
            {isValid && (
              <span className="text-[11px] text-emerald-500/70">
                Ready to analyze
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Submit Button ── */}
      <div className="mt-5">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="btn-primary w-full text-[15px] h-14"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-[18px] h-[18px]" />
              <span>Analyze Requirements</span>
            </>
          )}
        </button>
      </div>

      {/* ── How it works ── */}
      {!requirements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            {
              step: "01",
              title: "Paste requirements",
              desc: "Drop in any project requirement text — PRDs, user stories, specs",
            },
            {
              step: "02",
              title: "AI analysis",
              desc: "Gemini reviews like a senior architect with 15+ years of experience",
            },
            {
              step: "03",
              title: "Get insights",
              desc: "Receive categorized findings — gaps, edge cases, ambiguities & more",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="glass-hover p-4 group cursor-default"
            >
              <span className="text-[10px] font-bold text-indigo-500/60 uppercase tracking-widest">
                Step {s.step}
              </span>
              <h3 className="text-sm font-semibold text-gray-300 mt-2 group-hover:text-white transition-colors">
                {s.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </form>
  );
}
