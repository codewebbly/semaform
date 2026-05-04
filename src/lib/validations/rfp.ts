import { z } from "zod";

export const rfpSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  fundingAmount: z.coerce.number().positive("Funding amount must be a positive number"),
  deadline: z.string().min(1, "Deadline is required"),
  focusAreas: z.array(z.string().min(1)).min(1, "At least one focus area is required"),
  geographies: z.array(z.string().min(1)).min(1, "At least one geography is required"),
  eligibilityCriteria: z.string().min(10, "Eligibility criteria must be at least 10 characters"),
  sourceType: z.enum(["MANUAL", "IMPORTED"]).default("MANUAL"),
});

export type RFPInput = z.infer<typeof rfpSchema>;
