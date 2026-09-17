"use client";

import React, { useState } from "react";
import { Copy, Check, FileCode, Maximize2, Minimize2 } from "lucide-react";

interface CodeViewerProps {
  code: string;
  filename?: string;
  language?: string;
  maxHeight?: string;
}

export default function CodeViewer({
  code,
  filename = "solution.py",
  language = "python",
  maxHeight = "450px",
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code ? code.split("\n") : [];

  return (
    <div className="rounded-xl border border-navy-border/80 bg-[#0d121f] overflow-hidden shadow-xl font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary/90 border-b border-navy-border/60 text-brand-muted">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-teal-accent" />
          <span className="text-brand-white font-medium">{filename}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-navy-deep border border-navy-border text-teal-accent">
            {language}
          </span>
          <span className="text-[11px] text-brand-dim">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded hover:bg-navy-deep text-brand-muted hover:text-brand-white transition-colors"
            title={isExpanded ? "Collapse height" : "Expand height"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-navy-deep/60 hover:bg-teal-accent/20 text-brand-muted hover:text-teal-accent transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-status-green" />
                <span className="text-status-green text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code viewport */}
      <div
        className="overflow-auto p-4 select-text"
        style={{ maxHeight: isExpanded ? "850px" : maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-navy-deep/20 transition-colors">
                <td className="pr-4 py-0.5 text-brand-dim text-right select-none font-mono text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="py-0.5 text-brand-white/90 whitespace-pre font-mono leading-relaxed pl-2 border-l border-navy-border/30">
                  {line || "\u00A0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
