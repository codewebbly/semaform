import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { RFPForm } from "@/components/rfps/RFPForm";

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

export default async function NewRFPPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "DONOR") redirect("/auth/login");

  const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/donor/profile");

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={DONOR_NAV} role="Donor" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-2xl mx-auto px-6 py-8">

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A18]">Post a new RFP</h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              Visible to all nonprofits on the platform immediately after posting.
            </p>
          </div>

          <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-6">
            <RFPForm sourceType="MANUAL" redirectTo="/donor/rfps" />
          </div>

        </main>
      </div>
    </div>
  );
}
