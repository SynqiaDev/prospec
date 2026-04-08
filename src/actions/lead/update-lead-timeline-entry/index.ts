"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { leadTimelineEntries } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  entry_id: z.string().uuid(),
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

export const updateLeadTimelineEntry = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const [existing] = await db
      .select({
        id: leadTimelineEntries.id,
        lead_id: leadTimelineEntries.lead_id,
        project_id: leadTimelineEntries.project_id,
      })
      .from(leadTimelineEntries)
      .where(eq(leadTimelineEntries.id, parsedInput.entry_id))
      .limit(1);

    if (
      !existing ||
      existing.lead_id !== parsedInput.lead_id ||
      existing.project_id !== parsedInput.project_id
    ) {
      return { success: false, error: "Entrada não encontrada ou sem permissão" };
    }

    const [updated] = await db
      .update(leadTimelineEntries)
      .set({
        entry_type: parsedInput.entry_type,
        body: parsedInput.body,
        channel: parsedInput.channel || null,
        direction: parsedInput.direction || null,
        outcome: parsedInput.outcome || null,
        follow_up_at: parsedInput.follow_up_at ?? null,
        ...(parsedInput.occurred_at != null ? { occurred_at: parsedInput.occurred_at } : {}),
      })
      .where(
        and(
          eq(leadTimelineEntries.id, parsedInput.entry_id),
          eq(leadTimelineEntries.lead_id, parsedInput.lead_id),
          eq(leadTimelineEntries.project_id, parsedInput.project_id),
        ),
      )
      .returning();

    if (!updated) {
      return { success: false, error: "Não foi possível atualizar a entrada" };
    }

    const base = `/dashboard/projects/${parsedInput.project_id}`;
    revalidatePath(`${base}/leads/${parsedInput.lead_id}`);
    revalidatePath(base);
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  });
