import { PrismaClient, Role, SourceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const DONOR_PASSWORD = await bcrypt.hash("password123", 12);
  const NP_PASSWORD = await bcrypt.hash("password123", 12);
  const ADMIN_PASSWORD = await bcrypt.hash("Admin@HIE2024!", 12);

  // ─── Admin ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@handshake.io" },
    update: {},
    create: { email: "admin@handshake.io", passwordHash: ADMIN_PASSWORD, role: Role.ADMIN },
  });

  // ─── Donor: All States Foundation ─────────────────────────────────────────
  const donorUser = await prisma.user.upsert({
    where: { email: "donor@allstates.org" },
    update: {},
    create: { email: "donor@allstates.org", passwordHash: DONOR_PASSWORD, role: Role.DONOR },
  });

  const donorProfile = await prisma.donorProfile.upsert({
    where: { userId: donorUser.id },
    update: {},
    create: {
      userId: donorUser.id,
      orgName: "All States Foundation",
      mission: "Funding equitable access to education, healthcare, and clean water across all US states, territories, and selected international communities.",
      focusAreas: ["Education", "Healthcare", "Clean Water", "Economic Opportunity"],
      geographies: ["United States", "Sub-Saharan Africa", "South Asia"],
      annualBudgetRange: "$10M–$50M",
    },
  });

  // ─── Nonprofits ────────────────────────────────────────────────────────────
  const nonprofits = [
    {
      email: "info@cleanwaterinitiative.org",
      orgName: "Clean Water Initiative",
      mission: "Providing clean, safe drinking water to underserved communities across Sub-Saharan Africa through sustainable infrastructure projects.",
      focusAreas: ["Clean Water", "Sanitation", "Health"],
      serviceAreas: ["Sub-Saharan Africa", "Kenya", "Tanzania", "Ethiopia"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 6: Clean Water and Sanitation", "SDG 3: Good Health and Well-being"],
    },
    {
      email: "info@girlswhocodefoundation.org",
      orgName: "Girls Who Code Foundation",
      mission: "Closing the gender gap in technology by providing coding education and mentorship to girls in under-resourced communities.",
      focusAreas: ["STEM Education", "Gender Equality", "Technology"],
      serviceAreas: ["United States", "Northeast US", "California", "Texas"],
      annualBudget: "$5M–$10M",
      sdgAlignment: ["SDG 4: Quality Education", "SDG 5: Gender Equality"],
    },
    {
      email: "info@nefoodbankalliance.org",
      orgName: "Northeast Food Bank Alliance",
      mission: "Eliminating food insecurity by sourcing, storing, and distributing nutritious food to families in need across the Northeast United States.",
      focusAreas: ["Food Security", "Hunger Relief", "Community Services"],
      serviceAreas: ["Northeast US", "Massachusetts", "Connecticut", "Rhode Island", "Vermont"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 2: Zero Hunger", "SDG 1: No Poverty"],
    },
    {
      email: "info@globalclimatealliance.org",
      orgName: "Global Climate Alliance",
      mission: "Advocating for bold climate policy and supporting communities on the frontlines of climate change through research, organizing, and direct action.",
      focusAreas: ["Climate Change", "Environmental Advocacy", "Policy"],
      serviceAreas: ["Global", "Europe", "North America", "Pacific Island Nations"],
      annualBudget: "Over $10M",
      sdgAlignment: ["SDG 13: Climate Action", "SDG 15: Life on Land", "SDG 14: Life Below Water"],
    },
    {
      email: "info@veteranssupportnetwork.org",
      orgName: "Veterans Support Network",
      mission: "Supporting veterans and their families with mental health services, transitional housing, and employment programs across the Southeast.",
      focusAreas: ["Veterans", "Mental Health", "Housing", "Employment"],
      serviceAreas: ["Southeast US", "Georgia", "Florida", "Tennessee", "Alabama"],
      annualBudget: "$500K–$1M",
      sdgAlignment: ["SDG 16: Peace, Justice and Strong Institutions", "SDG 3: Good Health and Well-being"],
    },
    {
      email: "info@ruralhealthcarebridge.org",
      orgName: "Rural Healthcare Bridge",
      mission: "Expanding access to quality primary care, telehealth, and preventive services in rural and medically underserved communities across the Midwest.",
      focusAreas: ["Healthcare", "Rural Communities", "Telehealth"],
      serviceAreas: ["Midwest US", "Iowa", "Kansas", "Nebraska", "South Dakota", "North Dakota"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 3: Good Health and Well-being", "SDG 10: Reduced Inequalities"],
    },
    {
      email: "info@pacificoceanconservancy.org",
      orgName: "Pacific Ocean Conservancy",
      mission: "Protecting Pacific marine ecosystems from pollution and climate change through community-led science, advocacy, and coastal restoration.",
      focusAreas: ["Marine Conservation", "Environmental Science", "Ocean Health"],
      serviceAreas: ["Pacific Ocean Region", "California", "Hawaii", "Pacific Islands", "Oregon"],
      annualBudget: "$5M–$10M",
      sdgAlignment: ["SDG 14: Life Below Water", "SDG 13: Climate Action", "SDG 15: Life on Land"],
    },
    {
      email: "info@youthempowermentcenter.org",
      orgName: "Youth Empowerment Center LA",
      mission: "Providing mentorship, workforce skills, and educational support to at-risk youth in Los Angeles, preventing dropout and opening career pathways.",
      focusAreas: ["Youth Development", "Education", "Workforce Development"],
      serviceAreas: ["California", "Los Angeles", "Southern California"],
      annualBudget: "$500K–$1M",
      sdgAlignment: ["SDG 4: Quality Education", "SDG 10: Reduced Inequalities", "SDG 8: Decent Work and Economic Growth"],
    },
    {
      email: "info@texasrefugeeservices.org",
      orgName: "Texas Refugee Services",
      mission: "Supporting newly arrived refugees in Texas with resettlement assistance, English-language programs, and employment navigation.",
      focusAreas: ["Refugee Resettlement", "Immigration", "Social Services", "Employment"],
      serviceAreas: ["Texas", "Houston", "Dallas", "San Antonio", "Austin"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 16: Peace, Justice and Strong Institutions", "SDG 10: Reduced Inequalities", "SDG 1: No Poverty"],
    },
    {
      email: "info@nycmentalhealth.org",
      orgName: "NYC Mental Health Alliance",
      mission: "Expanding access to affordable, culturally competent mental health services for uninsured and low-income New Yorkers across all five boroughs.",
      focusAreas: ["Mental Health", "Healthcare Access", "Community Wellness"],
      serviceAreas: ["New York", "New York City", "Bronx", "Brooklyn", "Queens"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 3: Good Health and Well-being", "SDG 10: Reduced Inequalities"],
    },
    {
      email: "info@stemforall.org",
      orgName: "STEM For All Initiative",
      mission: "Increasing STEM education access for students in low-income and underrepresented communities through after-school programs, summer institutes, and teacher training.",
      focusAreas: ["STEM Education", "Educational Equity", "Technology", "Teacher Training"],
      serviceAreas: ["United States", "National", "Rural Communities", "Urban School Districts"],
      annualBudget: "$5M–$10M",
      sdgAlignment: ["SDG 4: Quality Education", "SDG 10: Reduced Inequalities", "SDG 9: Industry, Innovation and Infrastructure"],
    },
    {
      email: "info@womensbusinesscollective.org",
      orgName: "Women's Business Collective",
      mission: "Empowering women entrepreneurs in developing economies through business training, microfinance, and peer mentorship networks.",
      focusAreas: ["Women's Economic Empowerment", "Gender Equality", "Microfinance", "Entrepreneurship"],
      serviceAreas: ["International", "Sub-Saharan Africa", "South Asia", "Latin America", "East Africa"],
      annualBudget: "$1M–$5M",
      sdgAlignment: ["SDG 5: Gender Equality", "SDG 8: Decent Work and Economic Growth", "SDG 1: No Poverty"],
    },
    {
      email: "info@urbanfarmnetwork.org",
      orgName: "Urban Farm Network",
      mission: "Building community gardens and urban farms in food deserts to improve fresh food access, foster community cohesion, and train urban farmers.",
      focusAreas: ["Food Access", "Urban Agriculture", "Community Development"],
      serviceAreas: ["Urban Areas", "Chicago", "Detroit", "Baltimore", "Philadelphia", "Cleveland"],
      annualBudget: "$100K–$500K",
      sdgAlignment: ["SDG 2: Zero Hunger", "SDG 11: Sustainable Cities and Communities", "SDG 15: Life on Land"],
    },
    {
      email: "info@indigenousrightsproject.org",
      orgName: "Indigenous Rights Project",
      mission: "Protecting the legal rights, cultural heritage, land sovereignty, and self-determination of indigenous communities across the Americas.",
      focusAreas: ["Indigenous Rights", "Legal Advocacy", "Environmental Justice", "Cultural Preservation"],
      serviceAreas: ["Americas", "United States", "Canada", "Latin America", "Southwest US"],
      annualBudget: "$500K–$1M",
      sdgAlignment: ["SDG 16: Peace, Justice and Strong Institutions", "SDG 15: Life on Land", "SDG 10: Reduced Inequalities"],
    },
    {
      email: "info@appalachianlearning.org",
      orgName: "Appalachian Early Learning Fund",
      mission: "Expanding quality pre-K and early childhood education programs across rural Appalachian communities where access is severely limited.",
      focusAreas: ["Early Childhood Education", "Rural Communities", "Child Development"],
      serviceAreas: ["Appalachia", "West Virginia", "Kentucky", "Tennessee", "Eastern Ohio"],
      annualBudget: "$500K–$1M",
      sdgAlignment: ["SDG 4: Quality Education", "SDG 10: Reduced Inequalities", "SDG 1: No Poverty"],
    },
  ];

  const nonprofitProfiles = [];
  for (const np of nonprofits) {
    const { email, ...profileData } = np;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: NP_PASSWORD, role: Role.NONPROFIT },
    });
    const profile = await prisma.nonprofitProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, ...profileData },
    });
    nonprofitProfiles.push(profile);
  }

  // ─── RFPs ──────────────────────────────────────────────────────────────────
  const rfps = [
    {
      title: "Clean Water Access Grant 2024",
      description: "Supporting innovative, community-led solutions to provide clean, safe drinking water to populations without reliable water access. Preference for projects with sustainable infrastructure models and local capacity-building components.",
      fundingAmount: 500000,
      deadline: new Date("2024-12-31"),
      focusAreas: ["Clean Water", "Sanitation", "Infrastructure"],
      geographies: ["Sub-Saharan Africa", "Southeast Asia", "Latin America"],
      eligibilityCriteria: "501(c)(3) organizations with a minimum 3-year operating history. International organizations require a US-based fiscal sponsor.",
      sourceType: SourceType.MANUAL,
    },
    {
      title: "Educational Equity Initiative Grant",
      description: "Funding organizations that expand meaningful educational opportunities for underserved K-12 students through innovative programs, technology access, and teacher development.",
      fundingAmount: 250000,
      deadline: new Date("2024-11-30"),
      focusAreas: ["Education", "Educational Equity", "STEM"],
      geographies: ["United States", "National"],
      eligibilityCriteria: "US-based nonprofits with documented programs in Title I schools. Annual budget under $10M.",
      sourceType: SourceType.MANUAL,
    },
    {
      title: "Climate Resilience and Adaptation Fund",
      description: "Supporting community-based organizations helping vulnerable populations adapt to and recover from the impacts of climate change. Projects must demonstrate measurable resilience outcomes.",
      fundingAmount: 1000000,
      deadline: new Date("2025-01-31"),
      focusAreas: ["Climate Change", "Environmental Resilience", "Community Development"],
      geographies: ["Global", "Developing Nations", "Pacific Island Communities"],
      eligibilityCriteria: "Nonprofits with demonstrated climate adaptation work. International organizations must have a US fiscal sponsor. No lobbying organizations.",
      sourceType: SourceType.MANUAL,
    },
    {
      title: "Women's Leadership and Economic Empowerment Grant",
      description: "Funding programs that build women's economic independence, leadership capacity, and entrepreneurship skills in underserved communities, with preference for organizations led by women.",
      fundingAmount: 150000,
      deadline: new Date("2024-10-31"),
      focusAreas: ["Gender Equality", "Women's Empowerment", "Economic Development"],
      geographies: ["International", "Sub-Saharan Africa", "South Asia", "Latin America"],
      eligibilityCriteria: "Organizations led by or primarily serving women. Annual operating budget under $5M. Minimum 2 years of operation.",
      sourceType: SourceType.MANUAL,
    },
    {
      title: "Food Security Innovation Grant",
      description: "Supporting scalable, innovative approaches to food production, distribution, and access that measurably address hunger in urban and rural US communities.",
      fundingAmount: 300000,
      deadline: new Date("2024-12-15"),
      focusAreas: ["Food Security", "Agriculture", "Innovation", "Community"],
      geographies: ["United States", "Urban Areas", "Rural Communities"],
      eligibilityCriteria: "US-based 501(c)(3) with active food access or production programs. Applicants must demonstrate measurable impact metrics from prior work.",
      sourceType: SourceType.MANUAL,
    },
  ];

  for (const rfp of rfps) {
    await prisma.rFP.create({ data: { ...rfp, donorId: donorProfile.id } });
  }

  console.log(`✓ Seeded: 1 admin, 1 donor (All States Foundation), ${nonprofitProfiles.length} nonprofits, ${rfps.length} RFPs`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
