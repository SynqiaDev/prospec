"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { LeadRow } from "./lead-columns";
import { LeadForm } from "./lead-form";

interface EditLeadDialogProps {
  lead: LeadRow | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditLeadDialog = ({
  lead,
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: EditLeadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg xl:max-w-5xl xl:p-6">
        <DialogHeader>
          <DialogTitle>Editar lead</DialogTitle>
          <DialogDescription>{lead?.name}</DialogDescription>
        </DialogHeader>
        {lead ? (
          <LeadForm
            key={lead.id}
            projectId={projectId}
            defaultValues={lead}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
