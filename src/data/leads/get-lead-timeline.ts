import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { leadTimelineEntries } from "@/db/schema";

interface GetLeadTimelineByLeadIdParams {
  leadId: string;
}

export const getLeadTimelineByLeadId = async ({ leadId }: GetLeadTimelineByLeadIdParams) => {
  return db
    .select()
    .from(leadTimelineEntries)
    .where(eq(leadTimelineEntries.lead_id, leadId))
    .orderBy(desc(leadTimelineEntries.occurred_at));
};
