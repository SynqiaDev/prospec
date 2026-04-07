"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteLead } from "@/actions/lead/delete-lead";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { LeadRow } from "./lead-columns";

interface DeleteLeadDialogProps {
  lead: LeadRow | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const DeleteLeadDialog = ({
  lead,
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteLeadDialogProps) => {
  const { execute, status } = useAction(deleteLead, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Lead excluído.");
        onSuccess();
      } else {
        toast.error(data?.error || "Erro ao excluir");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao excluir");
    },
  });

  const loading = status === "executing";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir lead</AlertDialogTitle>
          <AlertDialogDescription>
            Confirma a exclusão de &quot;{lead?.name}&quot;? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogCancel disabled={loading}>
                <X className="h-4 w-4" />
              </AlertDialogCancel>
            </TooltipTrigger>
            <TooltipContent>Cancelar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogAction
                disabled={loading || !lead}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.preventDefault();
                  if (!lead) return;
                  execute({ id: lead.id, project_id: projectId });
                }}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <Trash2 className="h-4 w-4" />
              </AlertDialogAction>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
