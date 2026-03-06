import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CreateRestaurantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(3),
});

export const UpsertMenuSchema = z.object({
  type: z.enum(["MAIN", "DRINKS", "DESSERT"]),
  content: z.string().max(20000).optional().default(""),
  isPublished: z.boolean().optional().default(false),
});
