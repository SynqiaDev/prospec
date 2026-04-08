"use client";

import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ConvertLeadDialog } from "./convert-lead-dialog";
import { CreateLeadDialog } from "./create-lead-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";
import { EditLeadDialog } from "./edit-lead-dialog";
import { createLeadColumns, type LeadRow } from "./lead-columns";
import { LeadMobileCards } from "./lead-mobile-cards";

interface LeadsTableProps {
  projectId: string;
  leads: LeadRow[];
}

export const LeadsTable = ({ projectId, leads }: LeadsTableProps) => {
  const router = useRouter();
  const [editLead, setEditLead] = useState<LeadRow | null>(null);
  const [deleteLead, setDeleteLead] = useState<LeadRow | null>(null);
  const [convertLead, setConvertLead] = useState<LeadRow | null>(null);
  const columns = useMemo(
    () =>
      createLeadColumns({
        projectId,
        onEdit: setEditLead,
        onDelete: setDeleteLead,
        onConvert: setConvertLead,
      }),
    [projectId],
  );

  const refresh = () => router.refresh();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <CreateLeadDialog projectId={projectId} onSuccess={refresh} />
      </div>
      <div className="xl:hidden">
        <LeadMobileCards
          projectId={projectId}
          leads={leads}
          onEdit={setEditLead}
          onDelete={setDeleteLead}
          onConvert={setConvertLead}
        />
      </div>
      <div className="hidden xl:block">
        <DataTable columns={columns} data={leads} />
      </div>
      <EditLeadDialog
        lead={editLead}
        projectId={projectId}
        open={!!editLead}
        onOpenChange={(open) => !open && setEditLead(null)}
        onSuccess={() => {
          refresh();
          setEditLead(null);
        }}
      />
      <DeleteLeadDialog
        lead={deleteLead}
        projectId={projectId}
        open={!!deleteLead}
        onOpenChange={(open) => !open && setDeleteLead(null)}
        onSuccess={() => {
          refresh();
          setDeleteLead(null);
        }}
      />
      <ConvertLeadDialog
        lead={convertLead}
        projectId={projectId}
        open={!!convertLead}
        onOpenChange={(open) => !open && setConvertLead(null)}
        onSuccess={() => {
          refresh();
          setConvertLead(null);
        }}
      />
    </div>
  );
};
