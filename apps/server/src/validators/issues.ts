import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().min(3).max(20),
  boardId: z.number().int().positive(),
  assignedTo: z.string(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export const boardIdSchema = z.object({
    boardId : z.number().int().positive()
})

export const issueSchema = z.object({
    issueId: z.number().int().positive()
})