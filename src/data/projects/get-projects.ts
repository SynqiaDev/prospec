import { count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { leads, projects } from "@/db/schema";

export async function getProjects() {
  const projectRows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.created_at));

  const counts = await db
    .select({ projectId: leads.project_id, n: count() })
    .from(leads)
    .groupBy(leads.project_id);

  const map = new Map(counts.map((c) => [c.projectId, Number(c.n)]));

  return projectRows.map((p) => ({
    ...p,
    lead_count: map.get(p.id) ?? 0,
  }));
}

export async function getProjectById(id: string) {
  const [row] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  return row ?? null;
}
