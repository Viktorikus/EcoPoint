import { z } from "zod"
import { NextResponse } from "next/server"

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, "Password must contain uppercase, lowercase, and number"),
  phone: z.string().optional(),
  address: z.string().optional()
})

export const depositSchema = z.object({
  categoryId: z.string().uuid(),
  weight: z.number().positive().max(1000),
  notes: z.string().max(500).optional()
})

export const pickupSchema = z.object({
  address: z.string().min(5).max(200),
  scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(), { message: "Must be a valid future date" }),
  notes: z.string().max(500).optional()
})

export const reportSchema = z.object({
  location: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
})

export const rewardRedeemSchema = z.object({
  rewardId: z.string().uuid()
})

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional()
})

export async function validateBody<T>(schema: z.ZodType<T>, req: Request): Promise<{ data: T | null; error: NextResponse | null }> {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      return { data: null, error: NextResponse.json({ error: "Validation failed", details: fieldErrors }, { status: 400 }) }
    }
    return { data: parsed.data, error: null }
  } catch (e) {
    return { data: null, error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) }
  }
}

export function sanitizeString(str: string): string {
  return str.replace(/<[^>]*>?/gm, '').trim()
}
