import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { PublishButton } from "@/components/admin/PublishButton";

const GridIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="5" height="5" rx="1" /><rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" /><rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);
const UsersIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1 13.5a5 5 0 0 1 10 0" />
    <circle cx="12.5" cy="5.5" r="2" />
    <path d="M15 13.5a3 3 0 0 0-5-2.1" />
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
const FileIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 1.5z" />
    <path d="M9.5 1.5V5.5H13.5" />
  </svg>
);
const StarIcon = (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L8 10.6l-3.6 1.9.7-4-2.9-2.8 4-.6L8 1.5z" />
  </svg>
);

const ADMIN_NAV = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: GridIcon,  exact: true },
  { href: "/admin/users",        label: "Users",        icon: UsersIcon               },
  { href: "/admin/rfps",         label: "All RFPs",     icon: DocIcon,   exact: true },
  { href: "/admin/rfps/queue",   label: "Import Queue", icon: InboxIcon               },
  { href: "/admin/applications", label: "Applications", icon: FileIcon                },
  { href: "/admin/matches",      label: "Matches",      icon: StarIcon                },
];

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type RFPRow = { id: string; title: string; fundingAmount: number; deadline: Date; createdAt: Date; published: boolean };

function RFPTable({ rfps }: { rfps: RFPRow[] }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#F1F0ED]">
              <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Title</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden sm:table-cell">Funding</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden md:table-cell">Deadline</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide hidden md:table-cell">Imported</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#9B9A96] tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F0ED]">
            {rfps.map((rfp) => (
              <tr key={rfp.id} className="hover:bg-[#F8F8F7]/60 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-[#1A1A18] truncate max-w-xs">{rfp.title}</p>
                </td>
                <td className="px-5 py-3.5 text-[#6B6A66] hidden sm:table-cell">
                  ${rfp.fundingAmount.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-[#9B9A96] hidden md:table-cell">{fmt(rfp.deadline)}</td>
                <td className="px-5 py-3.5 text-[#9B9A96] hidden md:table-cell">{fmt(rfp.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/rfps/${rfp.id}/edit`}
                      className="text-xs font-medium px-3 py-1.5 rounded-[6px] border border-[#E5E4E0] text-[#6B6A66] bg-white hover:bg-[#F8F8F7] transition-colors"
                    >
                      Edit
                    </Link>
                    <PublishButton rfpId={rfp.id} published={rfp.published} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function AdminRFPQueuePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/auth/login");

  const rfps = await prisma.rFP.findMany({
    where: { sourceType: "IMPORTED" },
    orderBy: { createdAt: "desc" },
  });

  const pending   = rfps.filter((r) => !r.published);
  const published = rfps.filter((r) => r.published);

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={ADMIN_NAV} role="Admin" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="flex items-start justify-between mb-6">
            <div>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 text-sm text-[#6B6A66] hover:text-[#1A1A18] transition-colors mb-2"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
                Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-[#1A1A18]">RFP Import Queue</h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                {pending.length} pending review · {published.length} published
              </p>
            </div>
            <Link href="/admin/rfps/import">
              <Button size="sm">Import new RFP</Button>
            </Link>
          </div>

          {rfps.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66] mb-4">No imported RFPs yet.</p>
              <Link href="/admin/rfps/import" className="text-sm text-[#1A6BFF] hover:underline">
                Import your first external RFP →
              </Link>
            </div>
          ) : (
            <div className="space-y-7">
              {pending.length > 0 && (
                <section>
                  <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-3">
                    Pending review ({pending.length})
                  </p>
                  <RFPTable rfps={pending} />
                </section>
              )}
              {published.length > 0 && (
                <section>
                  <p className="text-[11px] font-semibold text-[#9B9A96] uppercase tracking-wider mb-3">
                    Published ({published.length})
                  </p>
                  <RFPTable rfps={published} />
                </section>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
