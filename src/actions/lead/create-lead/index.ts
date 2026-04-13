"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { parseBrazilAddress } from "@/lib/address-parser";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  website_url: z.string().optional(),
  google_rating: z.number().min(0).max(5).optional(),
  google_review_count: z.number().int().min(0).optional(),
  observations: z.string().optional(),
  contact_status: z.string().default("pending"),
  contact_date: z.coerce.date().optional().nullable(),
  conversion_status: z.string().default("not_converted"),
  conversion_date: z.coerce.date().optional().nullable(),
  project_id: z.string().uuid(),
});

export const createLead = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { project_id, google_rating, google_review_count, contact_date, conversion_date, ...rest } =
      parsedInput;
    const parsedAddress = parseBrazilAddress(rest.address);

    const [newLead] = await db
      .insert(leads)
      .values({
        ...rest,
        city: parsedAddress.city,
        state: parsedAddress.state,
        project_id,
        google_rating: google_rating ?? undefined,
        google_review_count: google_review_count ?? undefined,
        contact_date: contact_date ?? null,
        conversion_date: conversion_date ?? null,
      })
      .returning();

    revalidatePath(`/dashboard/projects/${project_id}`);
    revalidatePath("/dashboard");

    return { success: true, data: newLead };
  });
