import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { leads } from "@/db/schema";

interface GetLeadsByProjectIdParams {
  projectId: string;
  orderBy?: "created_at" | "name";
  orderDirection?: "asc" | "desc";
}

export const getLeadsByProjectId = async (params: GetLeadsByProjectIdParams) => {
  const { projectId, orderBy = "created_at", orderDirection = "desc" } = params;

  const orderFn = orderDirection === "desc" ? desc : asc;
  const column = orderBy === "name" ? leads.name : leads.created_at;

  return db
    .select()
    .from(leads)
    .where(eq(leads.project_id, projectId))
    .orderBy(orderFn(column));
};

export const getLeadById = async (id: string) => {
  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id))
    .limit(1);

  return lead ?? null;
};
