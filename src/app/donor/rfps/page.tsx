import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";

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

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatDate(d: Date | string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d));
}
function deadlineBadgeClass(d: Date | string) {
  const days = (new Date(d).getTime() - Date.now()) / 86_400_000;
  if (days < 0)  return "bg-[#F1F0ED] text-[#9B9A96]";
  if (days < 30) return "bg-[#FEF2F2] text-[#DC2626]";
  if (days < 60) return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#F0FDF4] text-[#16A34A]";
}

export default async function DonorRFPsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") redirect("/auth/login");

  const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/donor/profile");

  const rfps = await prisma.rFP.findMany({
    where: { donorId: profile.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={DONOR_NAV} role="Donor" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-5xl mx-auto px-6 py-8">

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-[#1A1A18]">My RFPs</h1>
              <p className="text-sm text-[#6B6A66] mt-1">
                {rfps.length} {rfps.length === 1 ? "RFP" : "RFPs"} posted
              </p>
            </div>
            <Link href="/donor/rfps/new">
              <Button size="sm">Post new RFP</Button>
            </Link>
          </div>

          {rfps.length === 0 ? (
            <div className="bg-white rounded-[8px] border border-dashed border-[#E5E4E0] p-16 text-center">
              <p className="text-sm text-[#6B6A66] mb-4">You haven&apos;t posted any RFPs yet.</p>
              <Link href="/donor/rfps/new">
                <Button>Post your first RFP</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[8px] border border-[#E5E4E0] overflow-hidden">
              {rfps.map((rfp, i) => (
                <div
                  key={rfp.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 ${
                    i < rfps.length - 1 ? "border-b border-[#F1F0ED]" : ""
                  } hover:bg-[#F8F8F7]/60 transition-colors`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#1A1A18] truncate">{rfp.title}</h3>
                    <p className="text-xs text-[#6B6A66] mt-0.5">
                      {formatCurrency(rfp.fundingAmount)}
                      {rfp.focusAreas.length > 0 && (
                        <> · {rfp.focusAreas.slice(0, 3).join(", ")}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${deadlineBadgeClass(rfp.deadline)}`}>
                      Due {formatDate(rfp.deadline)}
                    </span>
                    <span className="text-[#9B9A96]">
                      {rfp._count.applications} {rfp._count.applications === 1 ? "application" : "applications"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
