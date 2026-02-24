import { prisma } from "../lib/prisma";

export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function generateUniqueSlug(
  ownerId: string,
  name: string,
): Promise<string> {
  const baseSlug = slugify(name);

  // find existing similar slugs
  const existingSlugs = await prisma.organization.findMany({
    where: {
      ownerId,
      slug: {
        startsWith: baseSlug,
      },
    },
    select: {
      slug: true,
    },
  });

  if (existingSlugs.length === 0) {
    return baseSlug;
  }

  // extract numbers: help-1, help-2
  const slugNumbers = existingSlugs.map((org) => {
    const parts = org.slug.split("-");
    const lastPart = parts[parts.length - 1];

    const num = Number(lastPart);

    return Number.isNaN(num) ? 0 : num;
  });

  const maxNumber = Math.max(...slugNumbers);

  return `${baseSlug}-${maxNumber + 1}`;
}
