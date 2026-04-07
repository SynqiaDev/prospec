"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
});

export const updateProject = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { id, ...data } = parsedInput;

    const [updated] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return { success: false, error: "Projeto não encontrado" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/projects/${id}`);

    return { success: true, data: updated };
  });
