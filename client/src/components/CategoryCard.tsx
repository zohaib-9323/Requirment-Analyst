"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  AlertTriangle,
  HelpCircle,
  Zap,
  Code,
  Briefcase,
  Copy,
  Check,
} from "lucide-react";
import { AnalysisItem, AnalysisCategory } from "@/types";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  HelpCircle,
  Zap,
  Code,
  Briefcase,
};

interface CategoryCardProps {
  category: AnalysisCategory;
  items: AnalysisItem[];
  index: number;
}

export default function CategoryCard({
  category,
  items,
  index,
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const Icon = iconMap[category.icon] || AlertTriangle;

  const handleCopyItem = async (item: AnalysisItem, idx: number) => {
    await navigator.clipboard.writeText(`${item.title}\n${item.description}`);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="glass overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl ${category.bgColor} ${category.borderColor} border flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className={`w-[18px] h-[18px] ${category.color}`} />
          </div>
          <div className="text-left">
            <h3 className="text-[13px] font-bold text-white flex items-center gap-2">
              {category.label}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${category.bgColor} ${category.color}`}
              >
                {items.length}
              </span>
            </h3>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {category.description}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </motion.div>
      </button>

      {/* Items */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05]">
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className={`group/item relative px-5 py-4 ${
                    i !== items.length - 1
                      ? "border-b border-white/[0.03]"
                      : ""
                  } hover:bg-white/[0.015] transition-colors`}
                >
                  <div className="flex gap-3.5">
                    {/* Number indicator */}
                    <div className="flex-shrink-0 pt-0.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold ${category.bgColor} ${category.color} border ${category.borderColor}`}
                      >
                        {i + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold text-gray-200 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[12.5px] text-gray-500 leading-relaxed mt-1.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Copy button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyItem(item, i);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 self-start mt-0.5"
                      title="Copy"
                    >
                      {copiedIdx === i ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-600 hover:text-gray-400" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
