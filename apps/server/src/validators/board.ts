import {z} from "zod";

export  const baordSchema = z.object({
    title : z.string().min(3).max(20),
    organizationId: z.number().int().positive()
})

export const getBoardSchema = z.object({
    organizationId : z.number().int().positive()
})