"use client";

import { useEffect, useState } from "react";

interface MatchData {
  score: number;
  justification: string;
}

interface Props {
  rfpId: string;
  initialScore?: MatchData;
}

function badgeStyle(score: number): string {
  if (score >= 75) return "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]";
  if (score >= 50) return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]";
  return "bg-[#F1F0ED] text-[#6B6A66] border-[#E5E4E0]";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Partial match";
  return "Low match";
}

export function MatchBadge({ rfpId, initialScore }: Props) {
  const [data, setData] = useState<MatchData | null>(initialScore ?? null);
  const [loading, setLoading] = useState(!initialScore);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialScore) return;
    setError(false);
    fetch(`/api/match?rfpId=${rfpId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: MatchData) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [rfpId, initialScore]);

  if (loading) {
    return (
      <span
        className="inline-block w-20 h-5 bg-[#F1F0ED] rounded-full animate-pulse"
        aria-label="Computing match score…"
      />
    );
  }

  if (error) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-[#F8F8F7] text-[#9B9A96] border-[#E5E4E0]">
        Unavailable
      </span>
    );
  }

  if (!data) return null;

  return (
    <div className="relative group inline-block">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-default select-none ${badgeStyle(data.score)}`}
        aria-label={`Match score ${data.score} out of 100`}
      >
        <span className="font-bold tabular-nums">{data.score}</span>
        <span className="opacity-70 font-normal">{scoreLabel(data.score)}</span>
      </span>

      {/* Tooltip */}
      <div
        role="tooltip"
        className="absolute bottom-full right-0 mb-2.5 w-64 bg-[#1A1A18] text-white rounded-[8px] px-3.5 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20"
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9B9A96] mb-1">
          AI Match Score
        </p>
        <p className="text-lg font-bold leading-none mb-2">
          {data.score}
          <span className="text-sm font-normal text-[#9B9A96] ml-1">/ 100</span>
        </p>
        <p className="text-[11px] text-[#9B9A96] leading-relaxed">{data.justification}</p>
        <span
          className="absolute top-full right-4 border-[5px] border-transparent border-t-[#1A1A18]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
