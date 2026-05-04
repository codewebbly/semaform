import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { ApplicationStatus } from "@prisma/client";

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

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  SUBMITTED:    "bg-[#EEF4FF] text-[#1A6BFF]",
  UNDER_REVIEW: "bg-[#FFFBEB] text-[#D97706]",
  SHORTLISTED:  "bg-[#FAF5FF] text-[#7C3AED]",
  APPROVED:     "bg-[#F0FDF4] text-[#16A34A]",
  REJECTED:     "bg-[#FEF2F2] text-[#DC2626]",
  FUNDED:       "bg-[#ECFDF5] text-[#059669]",
};
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted", UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted", APPROVED: "Approved",
  REJECTED: "Not Selected", FUNDED: "Funded",
};

function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}

export default async function NonprofitApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/nonprofit/profile");

  const applications = await prisma.application.findMany({
    where: { nonprofitId: profile.id },
    orderBy: { updatedAt: "desc" },
    include: {
      rfp: {
        select: {
          title: true,
          fundingAmount: true,
          deadline: true,
          donor: { select: { orgName: true } },
        },
      },
    },
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-[#1A1A18]">My Applications</h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              {applications.length} {applications.length === 1 ? "application" : "applications"} submitted
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66] mb-3">
                You haven&apos;t applied to any RFPs yet.
              </p>
              <Link href="/nonprofit/rfps" className="text-sm text-[#1A6BFF] hover:underline font-medium">
                Browse funding opportunities →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
              {applications.map((app, i) => (
                <div
                  key={app.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-[#F8F8F7]/60 transition-colors ${
                    i < applications.length - 1 ? "border-b border-[#F1F0ED]" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#1A1A18] truncate">
                      {app.rfp.title}
                    </h3>
                    <p className="text-xs text-[#6B6A66] mt-0.5">
                      {app.rfp.donor?.orgName ?? "External Funder"}
                      <span className="mx-1.5 text-[#E5E4E0]">·</span>
                      ${app.rfp.fundingAmount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2.5 mt-1 text-[11px] text-[#9B9A96]">
                      <span>Applied {formatDate(app.createdAt)}</span>
                      <span>·</span>
                      <span>Due {formatDate(app.rfp.deadline)}</span>
                      {app.updatedAt > app.createdAt && (
                        <>
                          <span>·</span>
                          <span>Updated {formatDate(app.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={`self-start sm:self-center inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_STYLE[app.status]}`}
                  >
                    {STATUS_LABEL[app.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
