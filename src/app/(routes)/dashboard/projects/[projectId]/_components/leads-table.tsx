"use client";

import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import { ConvertLeadDialog } from "./convert-lead-dialog";
import { CreateLeadDialog } from "./create-lead-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";
import { EditLeadDialog } from "./edit-lead-dialog";
import { createLeadColumns, type LeadRow } from "./lead-columns";
import {
  ALL_VALUE,
  LeadsFilters,
  matchesCreatedAtPreset,
  NO_STATE_VALUE,
  type DateRangePreset,
} from "./leads-filters";
import { LeadMobileCards } from "./lead-mobile-cards";

interface LeadsTableProps {
  projectId: string;
  leads: LeadRow[];
}

function filterLeads(
  rows: LeadRow[],
  criteria: {
    nameQuery: string;
    datePreset: DateRangePreset;
    stateUf: string;
    conversion: string;
    contactStatus: string;
    leadSource: string;
  },
): LeadRow[] {
  const q = criteria.nameQuery.trim().toLowerCase();
  return rows.filter((lead) => {
    if (q && !lead.name.toLowerCase().includes(q)) return false;
    if (!matchesCreatedAtPreset(lead.created_at, criteria.datePreset)) return false;
    if (criteria.stateUf !== ALL_VALUE) {
      const trimmed = (lead.state ?? "").trim();
      if (criteria.stateUf === NO_STATE_VALUE) {
        if (trimmed) return false;
      } else if (trimmed !== criteria.stateUf) return false;
    }
    if (criteria.conversion !== ALL_VALUE && lead.conversion_status !== criteria.conversion) {
      return false;
    }
    if (criteria.contactStatus !== ALL_VALUE && lead.contact_status !== criteria.contactStatus) {
      return false;
    }
    if (criteria.leadSource !== ALL_VALUE && lead.lead_source !== criteria.leadSource) {
      return false;
    }
    return true;
  });
}

export const LeadsTable = ({ projectId, leads }: LeadsTableProps) => {
  const router = useRouter();
  const [editLead, setEditLead] = useState<LeadRow | null>(null);
  const [deleteLead, setDeleteLead] = useState<LeadRow | null>(null);
  const [convertLead, setConvertLead] = useState<LeadRow | null>(null);

  const [nameQuery, setNameQuery] = useState("");
  const deferredName = useDeferredValue(nameQuery);
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [stateUf, setStateUf] = useState(ALL_VALUE);
  const [conversion, setConversion] = useState(ALL_VALUE);
  const [contactStatus, setContactStatus] = useState(ALL_VALUE);
  const [leadSource, setLeadSource] = useState(ALL_VALUE);

  const stateSelectOptions = useMemo(() => {
    const set = new Set<string>();
    let hasEmpty = false;
    for (const l of leads) {
      const s = (l.state ?? "").trim();
      if (!s) hasEmpty = true;
      else set.add(s);
    }
    const out: { value: string; label: string }[] = [];
    if (hasEmpty) out.push({ value: NO_STATE_VALUE, label: "Sem UF" });
    Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .forEach((uf) => out.push({ value: uf, label: uf }));
    return out;
  }, [leads]);

  const filterCriteria = useMemo(
    () => ({
      nameQuery: deferredName,
      datePreset,
      stateUf,
      conversion,
      contactStatus,
      leadSource,
    }),
    [deferredName, datePreset, stateUf, conversion, contactStatus, leadSource],
  );

  const filteredLeads = useMemo(() => filterLeads(leads, filterCriteria), [leads, filterCriteria]);

  const hasActiveFilters = useMemo(() => {
    return (
      nameQuery.trim() !== "" ||
      datePreset !== "all" ||
      stateUf !== ALL_VALUE ||
      conversion !== ALL_VALUE ||
      contactStatus !== ALL_VALUE ||
      leadSource !== ALL_VALUE
    );
  }, [nameQuery, datePreset, stateUf, conversion, contactStatus, leadSource]);

  const resetFilters = () => {
    setNameQuery("");
    setDatePreset("all");
    setStateUf(ALL_VALUE);
    setConversion(ALL_VALUE);
    setContactStatus(ALL_VALUE);
    setLeadSource(ALL_VALUE);
  };

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

  const showFilteredEmpty = filteredLeads.length === 0 && leads.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">
          <CreateLeadDialog projectId={projectId} onSuccess={refresh} />
        </div>
        <LeadsFilters
          nameQuery={nameQuery}
          onNameQueryChange={setNameQuery}
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          stateUf={stateUf}
          onStateUfChange={setStateUf}
          stateOptions={stateSelectOptions}
          conversion={conversion}
          onConversionChange={setConversion}
          contactStatus={contactStatus}
          onContactStatusChange={setContactStatus}
          leadSource={leadSource}
          onLeadSourceChange={setLeadSource}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
      <div className="xl:hidden">
        <LeadMobileCards
          projectId={projectId}
          leads={filteredLeads}
          projectLeadCount={leads.length}
          onEdit={setEditLead}
          onDelete={setDeleteLead}
          onConvert={setConvertLead}
        />
      </div>
      <div className="hidden xl:block">
        {showFilteredEmpty ? (
          <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
            Nenhum lead corresponde aos filtros.
          </p>
        ) : (
          <DataTable columns={columns} data={filteredLeads} />
        )}
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
