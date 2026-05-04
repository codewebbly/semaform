import { z } from "zod";

export const donorProfileSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  mission: z.string().min(10, "Mission must be at least 10 characters"),
  focusAreas: z.array(z.string().min(1)).min(1, "At least one focus area is required"),
  geographies: z.array(z.string().min(1)).min(1, "At least one geography is required"),
  annualBudgetRange: z.string().min(1, "Budget range is required"),
});

export const nonprofitProfileSchema = z.object({
  orgName: z.string().min(1, "Organization name is required"),
  mission: z.string().min(10, "Mission must be at least 10 characters"),
  focusAreas: z.array(z.string().min(1)).min(1, "At least one focus area is required"),
  serviceAreas: z.array(z.string().min(1)).min(1, "At least one service area is required"),
  annualBudget: z.string().min(1, "Annual budget is required"),
  sdgAlignment: z.array(z.string()),
});

export type DonorProfileInput = z.infer<typeof donorProfileSchema>;
export type NonprofitProfileInput = z.infer<typeof nonprofitProfileSchema>;
