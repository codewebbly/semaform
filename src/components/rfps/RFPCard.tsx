import Link from "next/link";
import { Prisma } from "@prisma/client";
import { MatchBadge } from "./MatchBadge";

type RFPWithDonor = Prisma.RFPGetPayload<{
  include: { donor: { select: { orgName: true } } };
}>;

interface MatchScore {
  score: number;
  justification: string;
}

interface Props {
  rfp: RFPWithDonor;
  showMatchScore?: boolean;
  initialMatchScore?: MatchScore;
  applyHref?: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));
}
function deadlineBadgeClass(d: Date | string) {
  const days = (new Date(d).getTime() - Date.now()) / 86_400_000;
  if (days < 0)  return "bg-[#F1F0ED] text-[#9B9A96]";
  if (days < 30) return "bg-[#FEF2F2] text-[#DC2626]";
  if (days < 60) return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F0FDF4] text-[#16A34A]";
}

export function RFPCard({ rfp, showMatchScore = false, initialMatchScore, applyHref }: Props) {
  const funderName = rfp.donor?.orgName ?? "External Funder";

  return (
    <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-5 hover:border-[#1A6BFF]/30 transition-colors">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#1A1A18] leading-snug">{rfp.title}</h3>
          <p className="text-xs text-[#6B6A66] mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>{funderName}</span>
            <span className="text-[#E5E4E0]">·</span>
            <span className="font-medium text-[#1A1A18]">{formatCurrency(rfp.fundingAmount)}</span>
            {rfp.sourceType === "IMPORTED" && (
              <>
                <span className="text-[#E5E4E0]">·</span>
                <span className="text-[#7C3AED] font-medium">External Grant</span>
              </>
            )}
          </p>
        </div>
        {showMatchScore && (
          <div className="shrink-0 mt-0.5">
            <MatchBadge rfpId={rfp.id} initialScore={initialMatchScore} />
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[#6B6A66] line-clamp-2 mb-3 leading-relaxed">
        {rfp.description}
      </p>

      {/* Tags */}
      {(rfp.focusAreas.length > 0 || rfp.geographies.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {rfp.focusAreas.map((area) => (
            <span
              key={area}
              className="text-[11px] font-medium bg-[#EEF4FF] text-[#1A6BFF] px-2 py-0.5 rounded-full"
            >
              {area}
            </span>
          ))}
          {rfp.geographies.map((geo) => (
            <span
              key={geo}
              className="text-[11px] font-medium bg-[#F1F0ED] text-[#6B6A66] px-2 py-0.5 rounded-full"
            >
              {geo}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F1F0ED] text-xs text-[#6B6A66]">
        <div className="flex items-center gap-3">
          <span>
            Due{" "}
            <span className={`inline-flex px-1.5 py-0.5 rounded-[4px] font-medium ${deadlineBadgeClass(rfp.deadline)}`}>
              {formatDate(rfp.deadline)}
            </span>
          </span>
          <span className="text-[#9B9A96]">Posted {formatDate(rfp.createdAt)}</span>
        </div>
        {applyHref && (
          <Link href={applyHref} className="text-[#1A6BFF] font-semibold hover:underline">
            Apply →
          </Link>
        )}
      </div>
    </div>
  );
}
