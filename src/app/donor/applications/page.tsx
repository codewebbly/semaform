import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusSelect } from "@/components/applications/StatusSelect";
import { StatusPipeline } from "@/components/applications/StatusPipeline";
import { cn } from "@/lib/utils";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const PlusIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);
const DocIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 1.5H4.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5.5L10 1.5z" />
    <path d="M10 1.5v4h3.5M6 9h4M6 11.5h2.5" />
  </svg>
);
const InboxIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 9.5h3.5l1 2h4l1-2h3.5" /><rect x="1.5" y="2.5" width="13" height="10" rx="1" />
  </svg>
);

const DONOR_NAV = [
  { href: "/donor/dashboard",    label: "Dashboard",    icon: GridIcon,  exact: true },
  { href: "/donor/rfps/new",     label: "Post RFP",     icon: PlusIcon,  exact: true },
  { href: "/donor/rfps",         label: "My RFPs",      icon: DocIcon,   exact: true },
  { href: "/donor/applications", label: "Applications", icon: InboxIcon               },
];

const STATUS_TABS = [
  { label: "All",          value: "" },
  { label: "Submitted",    value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Shortlisted",  value: "SHORTLISTED" },
  { label: "Approved",     value: "APPROVED" },
  { label: "Rejected",     value: "REJECTED" },
  { label: "Funded",       value: "FUNDED" },
] as const;

const VALID_STATUSES = STATUS_TABS.slice(1).map((t) => t.value);

interface Props {
  searchParams: { status?: string };
}

export default async function DonorApplicationsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") redirect("/auth/login");

  const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/donor/profile");

  const statusFilter = VALID_STATUSES.includes(searchParams.status as never)
    ? (searchParams.status as (typeof VALID_STATUSES)[number])
    : undefined;

  const [applications, rawCounts] = await Promise.all([
    prisma.application.findMany({
      where: {
        rfp: { donorId: profile.id },
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        rfp:       { select: { title: true, fundingAmount: true } },
        nonprofit: { select: { orgName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { rfp: { donorId: profile.id } },
      _count: { _all: true },
    }),
  ]);

  const counts = Object.fromEntries(rawCounts.map((sc) => [sc.status, sc._count._all]));
  const activeTab = searchParams.status ?? "";

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={DONOR_NAV} role="Donor" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18]">Applications</h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                {applications.length}{" "}
                {statusFilter
                  ? `${activeTab.replace("_", " ").toLowerCase()} `
                  : ""}
                {applications.length === 1 ? "application" : "applications"}
              </p>
            </div>
          </div>

          {/* Status pipeline overview */}
          <StatusPipeline counts={counts} />

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap mb-5">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={tab.value ? `?status=${tab.value}` : "?"}
                className={cn(
                  "px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors",
                  activeTab === tab.value
                    ? "bg-[#1A6BFF] text-white"
                    : "bg-white text-[#6B6A66] border border-[#E5E4E0] hover:bg-[#F8F8F7] hover:text-[#1A1A18]"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66]">
                No applications{statusFilter ? ` with status "${activeTab.replace("_", " ")}"` : " yet"}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F1F0ED]">
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Nonprofit</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">RFP</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Submitted</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F0ED]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-[#1A1A18]">
                          {app.nonprofit.orgName}
                        </td>
                        <td className="px-5 py-3.5 text-[#6B6A66] max-w-[200px]">
                          <p className="truncate">{app.rfp.title}</p>
                          <p className="text-xs text-[#9B9A96]">
                            ${app.rfp.fundingAmount.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-[#9B9A96] hidden sm:table-cell">
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusSelect applicationId={app.id} currentStatus={app.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
