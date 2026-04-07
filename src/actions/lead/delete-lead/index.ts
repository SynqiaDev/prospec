"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
});

export const deleteLead = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const [deleted] = await db
      .delete(leads)
      .where(eq(leads.id, parsedInput.id))
      .returning();

    if (!deleted) {
      return { success: false, error: "Lead não encontrado" };
    }

    revalidatePath(`/dashboard/projects/${parsedInput.project_id}`);
    revalidatePath("/dashboard");

    return { success: true };
  });
