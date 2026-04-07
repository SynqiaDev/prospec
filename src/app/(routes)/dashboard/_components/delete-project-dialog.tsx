"use client";

import { Loader2, Trash2, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteProject } from "@/actions/project/delete-project";
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

interface DeleteProjectDialogProps {
  project: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteProjectDialog = ({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) => {
  const router = useRouter();

  const { execute, status } = useAction(deleteProject, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Projeto excluído com sucesso!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(data?.error || "Erro ao excluir projeto");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao excluir projeto");
    },
  });

  const isLoading = status === "executing";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o projeto &quot;{project.name}&quot;? Todos os
            leads vinculados serão removidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogCancel disabled={isLoading}>
                <X className="h-4 w-4" />
              </AlertDialogCancel>
            </TooltipTrigger>
            <TooltipContent>Cancelar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogAction
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  execute({ id: project.id });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                <Trash2 className="h-4 w-4" />
              </AlertDialogAction>
            </TooltipTrigger>
            <TooltipContent>Excluir projeto</TooltipContent>
          </Tooltip>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
