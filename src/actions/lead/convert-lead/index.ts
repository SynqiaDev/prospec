"use server";

import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { leads } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  lead_id: z.string().uuid(),
  project_id: z.string().uuid(),
});

export const convertLead = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { lead_id, project_id } = parsedInput;

    const [existing] = await db
      .select({ id: leads.id, conversion_status: leads.conversion_status })
      .from(leads)
      .where(eq(leads.id, lead_id))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Lead não encontrado" };
    }

    if (existing.conversion_status === "converted") {
      return { success: false, error: "Lead já está marcado como convertido" };
    }

    const [updated] = await db
      .update(leads)
      .set({
        conversion_status: "converted",
        conversion_date: dayjs().toDate(),
      })
      .where(eq(leads.id, lead_id))
      .returning();

    if (!updated) {
      return { success: false, error: "Não foi possível atualizar o lead" };
    }

    revalidatePath(`/dashboard/projects/${project_id}`);
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  });
