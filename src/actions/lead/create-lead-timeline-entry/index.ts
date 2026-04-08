"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { leadTimelineEntries, leads } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  lead_id: z.string().uuid(),
  project_id: z.string().uuid(),
  entry_type: z.string().min(1).default("note"),
  body: z.string().min(1, "Descrição é obrigatória"),
  channel: z.string().optional(),
  direction: z.string().optional(),
  outcome: z.string().optional(),
  occurred_at: z.coerce.date().optional().nullable(),
  follow_up_at: z.coerce.date().optional().nullable(),
});

export const createLeadTimelineEntry = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const [lead] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.id, parsedInput.lead_id))
      .limit(1);

    if (!lead) {
      return { success: false, error: "Lead não encontrado" };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const [newEntry] = await db
      .insert(leadTimelineEntries)
      .values({
        lead_id: parsedInput.lead_id,
        project_id: parsedInput.project_id,
        author_user_id: session?.user?.id ?? null,
        entry_type: parsedInput.entry_type,
        body: parsedInput.body,
        channel: parsedInput.channel || undefined,
        direction: parsedInput.direction || undefined,
        outcome: parsedInput.outcome || undefined,
        occurred_at: parsedInput.occurred_at ?? undefined,
        follow_up_at: parsedInput.follow_up_at ?? null,
      })
      .returning();

    const base = `/dashboard/projects/${parsedInput.project_id}`;
    revalidatePath(`${base}/leads/${parsedInput.lead_id}`);
    revalidatePath(base);
    revalidatePath("/dashboard");

    return { success: true, data: newEntry };
  });
