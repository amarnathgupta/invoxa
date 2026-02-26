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

export const updateOrganizationInputSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.email("Invalid email").min(1, "Email is required").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  website: z.url().optional(),
  logoUrl: z.preprocess(
    (val) => {
      if (val === null) return undefined;
      if (typeof val === "string") return val.trim(); // trim karega but "" allow rahega
      return val;
    },
    z.union([z.url(), z.literal("")]).optional(),
  ),
  gstNumber: z.string().optional(),
  taxId: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});
