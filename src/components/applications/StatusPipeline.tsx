import Link from "next/link";

const STAGES = [
  { status: "SUBMITTED",    label: "Submitted",    color: "#1A6BFF", bg: "#EEF4FF" },
  { status: "UNDER_REVIEW", label: "Under Review", color: "#D97706", bg: "#FFFBEB" },
  { status: "SHORTLISTED",  label: "Shortlisted",  color: "#7C3AED", bg: "#FAF5FF" },
  { status: "APPROVED",     label: "Approved",     color: "#16A34A", bg: "#F0FDF4" },
  { status: "FUNDED",       label: "Funded",       color: "#059669", bg: "#ECFDF5" },
] as const;

interface Props {
  counts: Partial<Record<string, number>>;
}

export function StatusPipeline({ counts }: Props) {
  const rejected = counts["REJECTED"] ?? 0;

  return (
    <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-5 mb-5">
      <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-4">
        Application pipeline
      </p>

      <div className="flex items-center overflow-x-auto pb-1 gap-0">
        {STAGES.map((stage, i) => {
          const count = counts[stage.status] ?? 0;
          const active = count > 0;
          return (
            <div key={stage.status} className="flex items-center shrink-0">
              <Link
                href={count > 0 ? `?status=${stage.status}` : "?"}
                className="px-4 py-3 rounded-[6px] text-center min-w-[104px] transition-opacity"
                style={{ backgroundColor: active ? stage.bg : "#F8F8F7" }}
              >
                <p
                  className="text-[22px] font-semibold tabular-nums leading-none"
                  style={{ color: active ? stage.color : "#9B9A96" }}
                >
                  {count}
                </p>
                <p
                  className="text-[10px] font-semibold mt-1.5 uppercase tracking-wide"
                  style={{ color: active ? stage.color : "#9B9A96" }}
                >
                  {stage.label}
                </p>
              </Link>

              {i < STAGES.length - 1 && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="#D1D0CB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 mx-1"
                >
                  <path d="M5 3l6 5-6 5" />
                </svg>
              )}
            </div>
          );
        })}

        {rejected > 0 && (
          <div className="flex items-center shrink-0">
            <div className="w-px h-9 bg-[#E5E4E0] mx-3" />
            <Link
              href="?status=REJECTED"
              className="px-4 py-3 rounded-[6px] text-center min-w-[104px] bg-[#FEF2F2] transition-opacity hover:opacity-80"
            >
              <p className="text-[22px] font-semibold tabular-nums leading-none text-[#DC2626]">
                {rejected}
              </p>
              <p className="text-[10px] font-semibold mt-1.5 uppercase tracking-wide text-[#DC2626]">
                Not Selected
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
