import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

interface Props {
  params: { id: string };
}

// ─── nav ─────────────────────────────────────────────────────────────────────

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const SearchIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" />
  </svg>
);
const InboxIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" /><rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);

const NONPROFIT_NAV = [
  { href: "/nonprofit/dashboard",    label: "Dashboard",       icon: GridIcon,   exact: true },
  { href: "/nonprofit/rfps",         label: "Find RFPs",       icon: SearchIcon               },
  { href: "/nonprofit/applications", label: "My Applications", icon: InboxIcon                },
];

// ─── status config ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  SUBMITTED:    "Submitted — awaiting review",
  UNDER_REVIEW: "Under Review",
  SHORTLISTED:  "Shortlisted",
  APPROVED:     "Approved",
  REJECTED:     "Not Selected",
  FUNDED:       "Funded",
};
const STATUS_CLASS: Record<string, string> = {
  SUBMITTED:    "bg-[#EEF4FF] text-[#1A6BFF] border-[#BFDBFE]",
  UNDER_REVIEW: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
  SHORTLISTED:  "bg-[#FAF5FF] text-[#7C3AED] border-[#DDD6FE]",
  APPROVED:     "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
  REJECTED:     "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]",
  FUNDED:       "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
};

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(d));
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n);
}
function deadlineBadgeClass(d: Date | string) {
  const days = (new Date(d).getTime() - Date.now()) / 86_400_000;
  if (days < 0)  return "bg-[#F1F0ED] text-[#9B9A96]";
  if (days < 30) return "bg-[#FEF2F2] text-[#DC2626]";
  if (days < 60) return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F0FDF4] text-[#16A34A]";
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function ApplyPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/nonprofit/profile");

  const rfp = await prisma.rFP.findUnique({
    where: { id: params.id },
    include: { donor: { select: { orgName: true } } },
  });
  if (!rfp) notFound();

  const existing = await prisma.application.findUnique({
    where: { rfpId_nonprofitId: { rfpId: rfp.id, nonprofitId: profile.id } },
  });

  const defaultNarrative =
    `${profile.orgName} is dedicated to ${profile.mission} ` +
    `Our programs focus on ${profile.focusAreas.join(", ")} across ${profile.serviceAreas.join(", ")}, ` +
    `directly aligning with the priorities of this grant opportunity.`;

  const defaultBudgetNotes =
    `Annual operating budget: ${profile.annualBudget}. ` +
    `Requested funding: ${formatCurrency(rfp.fundingAmount)}.`;

  const funderName = rfp.donor?.orgName ?? "External Funder";

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-6xl mx-auto px-6 py-8">

          {/* Back link */}
          <Link
            href="/nonprofit/rfps"
            className="inline-flex items-center gap-1 text-sm text-[#6B6A66] hover:text-[#1A1A18] transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back to opportunities
          </Link>

          {/* Two-panel grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

            {/* ── Left panel: RFP details ── */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-5">

                {/* Funder */}
                <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-2">
                  {funderName}
                </p>

                {/* Title */}
                <h1 className="text-base font-semibold text-[#1A1A18] leading-snug mb-3">
                  {rfp.title}
                </h1>

                {/* Amount + deadline */}
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  <span className="text-sm font-semibold text-[#1A1A18]">
                    {formatCurrency(rfp.fundingAmount)}
                  </span>
                  <span className="text-[#E5E4E0]">·</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-[4px] ${deadlineBadgeClass(rfp.deadline)}`}>
                    Due {formatDate(rfp.deadline)}
                  </span>
                </div>

                <div className="border-t border-[#F1F0ED] mb-4" />

                {/* Description */}
                <p className="text-sm text-[#6B6A66] leading-relaxed mb-4">
                  {rfp.description}
                </p>

                {/* Tags */}
                {(rfp.focusAreas.length > 0 || rfp.geographies.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {rfp.focusAreas.map((area) => (
                      <span key={area} className="text-[11px] font-medium bg-[#EEF4FF] text-[#1A6BFF] px-2 py-0.5 rounded-full">
                        {area}
                      </span>
                    ))}
                    {rfp.geographies.map((geo) => (
                      <span key={geo} className="text-[11px] font-medium bg-[#F1F0ED] text-[#6B6A66] px-2 py-0.5 rounded-full">
                        {geo}
                      </span>
                    ))}
                  </div>
                )}

                {/* Eligibility */}
                {rfp.eligibilityCriteria && (
                  <>
                    <div className="border-t border-[#F1F0ED] mb-3" />
                    <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-2">
                      Eligibility
                    </p>
                    <p className="text-xs text-[#6B6A66] leading-relaxed">
                      {rfp.eligibilityCriteria}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* ── Right panel: form or status ── */}
            <div>
              {existing ? (
                /* Already applied */
                <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-6">
                  <h2 className="text-base font-semibold text-[#1A1A18] mb-1">
                    Application submitted
                  </h2>
                  <p className="text-sm text-[#6B6A66] mb-6">
                    You applied on {formatDate(existing.createdAt)}.
                  </p>

                  <div className="mb-6">
                    <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-2">
                      Current status
                    </p>
                    <span className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-[6px] border ${STATUS_CLASS[existing.status] ?? "bg-[#F1F0ED] text-[#6B6A66] border-[#E5E4E0]"}`}>
                      {STATUS_LABEL[existing.status] ?? existing.status}
                    </span>
                  </div>

                  <div className="border-t border-[#F1F0ED] pt-4">
                    <Link
                      href="/nonprofit/applications"
                      className="text-sm text-[#1A6BFF] hover:underline"
                    >
                      View all your applications →
                    </Link>
                  </div>
                </div>
              ) : (
                /* Application form */
                <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-6">
                  <div className="mb-5">
                    <h2 className="text-base font-semibold text-[#1A1A18]">
                      Submit your application
                    </h2>
                    <p className="text-sm text-[#6B6A66] mt-1">
                      Pre-filled from your profile — review and edit before submitting.
                    </p>
                  </div>
                  <ApplicationForm
                    rfpId={rfp.id}
                    defaultNarrative={defaultNarrative}
                    defaultBudgetNotes={defaultBudgetNotes}
                  />
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
