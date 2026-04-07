"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { LeadForm } from "./lead-form";

interface CreateLeadDialogProps {
  projectId: string;
  onSuccess: () => void;
}

export const CreateLeadDialog = ({ projectId, onSuccess }: CreateLeadDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo lead
              </Button>
            </DialogTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent>Adicionar lead</TooltipContent>
      </Tooltip>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg xl:max-w-5xl xl:p-6">
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
          <DialogDescription>Preencha os dados do lead de prospecção.</DialogDescription>
        </DialogHeader>
        <LeadForm
          projectId={projectId}
          onSuccess={() => {
            setOpen(false);
            onSuccess();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
