"use server";

import { z } from "zod";

import { getLeadTimelineByLeadId } from "@/data/leads/get-lead-timeline";
import { actionClient } from "@/lib/next-safe-action";

const schema = z.object({
  lead_id: z.string().uuid(),
});

export const listLeadTimelineEntries = actionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const entries = await getLeadTimelineByLeadId({ leadId: parsedInput.lead_id });
    return { success: true, data: entries };
  });
