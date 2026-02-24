import { z } from "zod";

export const createOrganizationInputSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email").min(1, "Email is required"),
    phone: z.string().min(10, "Phone must be at least 10 digits"),
    slug: z.string().optional(),
    website: z.url().optional(),
    logoUrl: z.url().optional(),
    gstNumber: z.string().optional(),
    taxId: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  })
  .strict();

// optional: type automatically generate ho jayega
export type createOrganizationInput = z.infer<
  typeof createOrganizationInputSchema
>;
