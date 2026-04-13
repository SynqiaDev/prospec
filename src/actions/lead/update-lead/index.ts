"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { parseBrazilAddress } from "@/lib/address-parser";
import { LEAD_SOURCE_VALUES } from "@/lib/lead-source";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  lead_source: z.enum(LEAD_SOURCE_VALUES).default("manual"),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  whatsapp_number: z.string().nullish(),
  website_url: z.string().nullish(),
  google_rating: z.number().min(0).max(5).nullish(),
  google_review_count: z.number().int().min(0).nullish(),
  observations: z.string().nullish(),
  contact_status: z.string().default("pending"),
  contact_date: z.coerce.date().optional().nullable(),
  conversion_status: z.string().default("not_converted"),
  conversion_date: z.coerce.date().optional().nullable(),
  project_id: z.string().uuid(),
});

export const updateLead = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { id, project_id, google_rating, google_review_count, contact_date, conversion_date, ...rest } =
      parsedInput;
    const [currentLead] = await db
      .select({ address: leads.address })
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);

    if (!currentLead) {
      return { success: false, error: "Lead não encontrado" };
    }

    const addressChanged = rest.address !== undefined && rest.address !== currentLead.address;
    const parsedAddress = addressChanged ? parseBrazilAddress(rest.address) : null;

    const [updated] = await db
      .update(leads)
      .set({
        ...rest,
        city: addressChanged ? parsedAddress?.city ?? null : undefined,
        state: addressChanged ? parsedAddress?.state ?? null : undefined,
        google_rating: google_rating === null ? null : google_rating,
        google_review_count:
          google_review_count === undefined
            ? undefined
            : (google_review_count ?? 0),
        contact_date: contact_date ?? null,
        conversion_date: conversion_date ?? null,
      })
      .where(eq(leads.id, id))
      .returning();

    revalidatePath(`/dashboard/projects/${project_id}`);
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  });
