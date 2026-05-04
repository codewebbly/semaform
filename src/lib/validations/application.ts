import { z } from "zod";

export const applicationSchema = z.object({
  rfpId: z.string().min(1, "RFP ID is required"),
  proposalNarrative: z.string().min(50, "Proposal narrative must be at least 50 characters"),
  budgetNotes: z.string().min(10, "Budget notes must be at least 10 characters"),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "APPROVED", "REJECTED", "FUNDED"]),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
