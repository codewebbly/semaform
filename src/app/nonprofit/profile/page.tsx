import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { NonprofitProfileForm } from "@/components/profile/NonprofitProfileForm";

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

export default async function NonprofitProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "NONPROFIT") redirect("/auth/login");

  const profile = await prisma.nonprofitProfile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="flex min-h-screen bg-[#F8F8F7]">
      <Sidebar navItems={NONPROFIT_NAV} role="Nonprofit" userEmail={session.user.email!} />

      <div className="flex-1 md:ml-[240px] pt-12 md:pt-0">
        <main className="max-w-2xl mx-auto px-6 py-8">

          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#1A1A18]">
              {profile ? "Edit profile" : "Set up your profile"}
            </h1>
            <p className="text-sm text-[#6B6A66] mt-1">
              {profile
                ? "Accurate mission and service area data improves your AI match scores."
                : "Tell us about your organization so we can surface the right funding opportunities."}
            </p>
          </div>

          <div className="bg-white rounded-[8px] border border-[#E5E4E0] p-6">
            <NonprofitProfileForm
              initialData={
                profile
                  ? {
                      orgName:      profile.orgName,
                      mission:      profile.mission,
                      focusAreas:   profile.focusAreas,
                      serviceAreas: profile.serviceAreas,
                      annualBudget: profile.annualBudget,
                      sdgAlignment: profile.sdgAlignment,
                    }
                  : undefined
              }
            />
          </div>

        </main>
      </div>
    </div>
  );
}
