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
});

export const deleteLeadTimelineEntry = actionClient
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

    await db
      .delete(leadTimelineEntries)
      .where(
        and(
          eq(leadTimelineEntries.id, parsedInput.entry_id),
          eq(leadTimelineEntries.lead_id, parsedInput.lead_id),
          eq(leadTimelineEntries.project_id, parsedInput.project_id),
        ),
      );

    const base = `/dashboard/projects/${parsedInput.project_id}`;
    revalidatePath(`${base}/leads/${parsedInput.lead_id}`);
    revalidatePath(base);
    revalidatePath("/dashboard");

    return { success: true };
  });
