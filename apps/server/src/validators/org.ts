import {z} from "zod";

export const orgSchema = z.object({
    organizationId: z.number().int().positive(),
    memberUsername: z.string().min(3)
})

export const orgDataSchema = z.object({
    title: z.string().min(3).max(20),
      description: z.string().min(10).max(100),
})

export const getOrgSchema = z.object({
    organizationId : z.number().int().positive()
})