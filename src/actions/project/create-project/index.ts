"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { projects } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const createProject = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const [newProject] = await db.insert(projects).values(parsedInput).returning();

    revalidatePath("/dashboard");

    return { success: true, data: newProject };
  });
