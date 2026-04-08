"use client";

import type { InferSelectModel } from "drizzle-orm";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { leadTimelineEntries } from "@/db/schema";

type LeadTimelineEntry = InferSelectModel<typeof leadTimelineEntries>;

const ENTRY_TYPE_LABELS: Record<string, string> = {
  note: "Anotação",
  contact_attempt: "Tentativa de contato",
  contact_reply: "Resposta de contato",
  status_change: "Mudança de status",
  conversion: "Conversão",
};

const CHANNEL_LABELS: Record<string, string> = {
  phone: "Ligação",
  whatsapp: "WhatsApp",
  email: "E-mail",
  visit: "Visita",
  instagram: "Instagram",
  other: "Outro",
};

const DIRECTION_LABELS: Record<string, string> = {
  inbound: "Entrada",
  outbound: "Saída",
};

interface LeadTimelineListProps {
  entries: LeadTimelineEntry[];
  onEdit?: (entry: LeadTimelineEntry) => void;
  onDelete?: (entry: LeadTimelineEntry) => void;
  activeEditId?: string | null;
}

const formatDateTime = (value: Date | null) => {
  if (!value) return "Sem data";
  return new Date(value).toLocaleString("pt-BR");
};

export const LeadTimelineList = ({
  entries,
  onEdit,
  onDelete,
  activeEditId,
}: LeadTimelineListProps) => {
  if (!entries.length) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Nenhuma anotação registrada para este lead.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`rounded-md border p-3 ${activeEditId === entry.id ? "border-primary ring-1 ring-primary/20" : ""}`}
        >
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{ENTRY_TYPE_LABELS[entry.entry_type] ?? entry.entry_type}</Badge>
              {entry.channel ? <Badge variant="secondary">{CHANNEL_LABELS[entry.channel] ?? entry.channel}</Badge> : null}
              {entry.direction ? (
                <Badge variant="secondary">{DIRECTION_LABELS[entry.direction] ?? entry.direction}</Badge>
              ) : null}
            </div>
            {onEdit || onDelete ? (
              <div className="flex shrink-0 items-center gap-0.5">
                {onEdit ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(entry)}
                        aria-label="Editar entrada"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                ) : null}
                {onDelete ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(entry)}
                        aria-label="Excluir entrada"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Excluir</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            ) : null}
          </div>
          <p className="text-sm">{entry.body}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>Quando: {formatDateTime(entry.occurred_at)}</span>
            {entry.follow_up_at ? <span>Próximo contato: {formatDateTime(entry.follow_up_at)}</span> : null}
            {entry.outcome ? <span>Resultado: {entry.outcome}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
