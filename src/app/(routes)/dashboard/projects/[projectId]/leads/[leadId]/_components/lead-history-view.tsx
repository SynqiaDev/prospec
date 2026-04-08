"use client";

import type { InferSelectModel } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteLeadTimelineEntry } from "@/actions/lead/delete-lead-timeline-entry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { leadTimelineEntries } from "@/db/schema";

import { LeadTimelineForm } from "../../../_components/lead-timeline-form";
import { LeadTimelineList } from "../../../_components/lead-timeline-list";

type LeadTimelineEntry = InferSelectModel<typeof leadTimelineEntries>;

interface LeadHistoryViewProps {
  projectId: string;
  leadId: string;
  entries: LeadTimelineEntry[];
}

export function LeadHistoryView({ projectId, leadId, entries }: LeadHistoryViewProps) {
  const router = useRouter();
  const [editingEntry, setEditingEntry] = useState<LeadTimelineEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadTimelineEntry | null>(null);

  const refresh = () => router.refresh();

  const { execute: executeDelete, status: deleteStatus } = useAction(deleteLeadTimelineEntry, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Entrada removida.");
        setDeleteTarget(null);
        refresh();
      } else {
        toast.error(data?.error ?? "Não foi possível excluir.");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao excluir");
    },
  });

  const deleting = deleteStatus === "executing";

  return (
    <>
      <div className="space-y-6">
        <LeadTimelineForm
          leadId={leadId}
          projectId={projectId}
          editingEntry={editingEntry}
          onCancelEdit={() => setEditingEntry(null)}
          onSuccess={() => {
            setEditingEntry(null);
            refresh();
          }}
        />
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Linha do tempo</h2>
          <LeadTimelineList
            entries={entries}
            onEdit={setEditingEntry}
            onDelete={setDeleteTarget}
            activeEditId={editingEntry?.id ?? null}
          />
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir entrada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente do histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting || !deleteTarget}
              onClick={(e) => {
                e.preventDefault();
                if (!deleteTarget) return;
                executeDelete({
                  entry_id: deleteTarget.id,
                  lead_id: leadId,
                  project_id: projectId,
                });
              }}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
