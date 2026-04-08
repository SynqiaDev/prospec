"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookText, Pencil, Star, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";

import {
  contactStatusLabels,
  contactStatusVariants,
  conversionLabels,
  conversionVariants,
  type LeadRow,
} from "./lead-columns";

interface LeadMobileCardsProps {
  projectId: string;
  leads: LeadRow[];
  onEdit: (lead: LeadRow) => void;
  onDelete: (lead: LeadRow) => void;
  onConvert: (lead: LeadRow) => void;
}

export function LeadMobileCards({
  projectId,
  leads,
  onEdit,
  onDelete,
  onConvert,
}: LeadMobileCardsProps) {
  if (leads.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        Nenhum lead neste projeto.
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {leads.map((lead) => {
        const canConvert = lead.conversion_status !== "converted";
        const contactKey = lead.contact_status ?? "";
        const convKey = lead.conversion_status ?? "";
        const rating = lead.google_rating;
        const hasGoogle =
          (rating != null && rating > 0) ||
          (lead.google_review_count != null && lead.google_review_count > 0);
        const phoneLine = [lead.phone, lead.whatsapp_number].filter(Boolean).join(" · ");

        return (
          <li
            key={lead.id}
            className="rounded-lg border border-border/70 bg-card/50 px-3.5 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight text-foreground">{lead.name}</p>
                {phoneLine ? (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{phoneLine}</p>
                ) : null}
                {hasGoogle ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                    <span>
                      {Number(rating ?? 0).toFixed(1)}
                      {lead.google_review_count != null ? (
                        <span className="text-muted-foreground/80">
                          {" "}
                          ({lead.google_review_count})
                        </span>
                      ) : null}
                    </span>
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <Link
                        href={`/dashboard/projects/${projectId}/leads/${lead.id}`}
                        aria-label="Histórico do lead"
                      >
                        <BookText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Histórico</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(lead)}
                      aria-label="Editar lead"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar</TooltipContent>
                </Tooltip>
                {canConvert ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onConvert(lead)}
                        aria-label="Marcar como convertido"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Marcar convertido</TooltipContent>
                  </Tooltip>
                ) : null}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(lead)}
                      aria-label="Excluir lead"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir</TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Badge variant={contactStatusVariants[contactKey] ?? "outline"} className="text-xs font-normal">
                {contactStatusLabels[contactKey] ?? contactKey}
              </Badge>
              <Badge variant={conversionVariants[convKey] ?? "outline"} className="text-xs font-normal">
                {conversionLabels[convKey] ?? convKey}
              </Badge>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
