"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "SUBMITTED",    label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED",  label: "Shortlisted" },
  { value: "APPROVED",     label: "Approved" },
  { value: "REJECTED",     label: "Rejected" },
  { value: "FUNDED",       label: "Funded" },
] as const;

type AppStatus = (typeof STATUS_OPTIONS)[number]["value"];

const STATUS_STYLE: Record<AppStatus, string> = {
  SUBMITTED:    "bg-[#EEF4FF] text-[#1A6BFF] border-[#BFDBFE]",
  UNDER_REVIEW: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  SHORTLISTED:  "bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]",
  APPROVED:     "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  REJECTED:     "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  FUNDED:       "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
};

interface Props {
  applicationId: string;
  currentStatus: AppStatus;
}

export function StatusSelect({ applicationId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleChange(next: AppStatus) {
    if (next === status || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setStatus(next);
        router.refresh();
      }
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value as AppStatus)}
      disabled={isUpdating}
      className={`text-[11px] font-medium px-2 py-1 rounded-full border cursor-pointer transition-colors disabled:opacity-60 focus:outline-none ${STATUS_STYLE[status]}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
