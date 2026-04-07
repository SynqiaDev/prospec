"use client";

import { Loader2, UserCheck, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { convertLead } from "@/actions/lead/convert-lead";
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

interface ConvertLeadDialogProps {
  lead: LeadRow | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const ConvertLeadDialog = ({
  lead,
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: ConvertLeadDialogProps) => {
  const { execute, status } = useAction(convertLead, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Lead marcado como convertido.");
        onSuccess();
      } else {
        toast.error(data?.error || "Não foi possível converter");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao converter");
    },
  });

  const loading = status === "executing";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Marcar como convertido</AlertDialogTitle>
          <AlertDialogDescription>
            O lead &quot;{lead?.name}&quot; será atualizado com status de conversão &quot;Convertido&quot; e data
            atual.
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
                onClick={(e) => {
                  e.preventDefault();
                  if (!lead) return;
                  execute({ lead_id: lead.id, project_id: projectId });
                }}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                <UserCheck className="h-4 w-4" />
              </AlertDialogAction>
            </TooltipTrigger>
            <TooltipContent>Confirmar</TooltipContent>
          </Tooltip>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
