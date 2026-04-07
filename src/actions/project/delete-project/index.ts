"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  id: z.string().uuid(),
});

export const deleteProject = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, parsedInput.id))
      .returning();

    if (!deleted) {
      return { success: false, error: "Projeto não encontrado" };
    }

    revalidatePath("/dashboard");

    return { success: true };
  });
