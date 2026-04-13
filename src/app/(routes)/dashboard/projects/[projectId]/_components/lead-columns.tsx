"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { InferSelectModel } from "drizzle-orm";
import { AtSign, BookText, MessageCircle, Pencil, Star, Trash2, UserCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { leads } from "@/db/schema";
import { getLeadSourceLabel } from "@/lib/lead-source";
import { formatBrazilPhoneDisplay } from "@/lib/phone-format";
import { buildWhatsappHref } from "@/lib/whatsapp-url";

export type LeadRow = InferSelectModel<typeof leads>;

export const contactStatusLabels: Record<string, string> = {
  pending: "Pendente",
  contacted: "Contatado",
  no_answer: "Sem resposta",
  scheduled: "Agendado",
};

export const contactStatusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  contacted: "default",
  no_answer: "destructive",
  scheduled: "secondary",
};

export const conversionLabels: Record<string, string> = {
  not_converted: "Não convertido",
  converted: "Convertido",
  lost: "Perdido",
};

export const conversionVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  not_converted: "outline",
  converted: "default",
  lost: "destructive",
};

export function createLeadColumns(handlers: {
  projectId: string;
  onEdit: (lead: LeadRow) => void;
  onDelete: (lead: LeadRow) => void;
  onConvert: (lead: LeadRow) => void;
}): ColumnDef<LeadRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      id: "city_state",
      header: "Cidade - UF",
      cell: ({ row }) => {
        const { city, state } = row.original;
        if (city && state) return `${city} - ${state}`;
        if (state) return state;
        return city ?? "—";
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => {
        const raw = row.getValue("phone") as string | null;
        if (!raw?.trim()) return "—";
        return formatBrazilPhoneDisplay(raw) || "—";
      },
    },
    {
      accessorKey: "whatsapp_number",
      header: "WhatsApp",
      cell: ({ row }) => {
        const raw = row.getValue("whatsapp_number") as string | null;
        const href = buildWhatsappHref(raw);
        if (!raw?.trim()) return "—";
        const display = formatBrazilPhoneDisplay(raw);
        return (
          <div className="flex max-w-[220px] items-center gap-1">
            <span className="truncate text-sm">{display}</span>
            {href ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <a href={href} target="_blank" rel="noreferrer" aria-label="Abrir WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Abrir no WhatsApp</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "website_url",
      header: "Site",
      cell: ({ row }) => {
        const url = row.getValue("website_url") as string | null;
        if (!url) return "—";
        return (
          <a
            href={url.startsWith("http") ? url : `https://${url}`}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline text-sm"
          >
            <AtSign className="h-4 w-4" />
          </a>
        );
      },
    },
    {
      accessorKey: "google_rating",
      header: "Google",
      cell: ({ row }) => {
        const rating = row.getValue("google_rating") as number | null;
        const count = row.original.google_review_count;
        if (!rating && count === 0) return "—";
        return (
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{Number(rating ?? 0).toFixed(1)}</span>
            <span className="text-muted-foreground">({count})</span>
          </div>
        );
      },
    },
    {
      accessorKey: "lead_source",
      header: "Origem",
      cell: ({ row }) => {
        const source = row.getValue("lead_source") as string | null;
        return <Badge variant="secondary">{getLeadSourceLabel(source)}</Badge>;
      },
    },
    {
      accessorKey: "contact_status",
      header: "Contato",
      cell: ({ row }) => {
        const v = row.getValue("contact_status") as string;
        return (
          <Badge variant={contactStatusVariants[v] ?? "outline"}>
            {contactStatusLabels[v] ?? v}
          </Badge>
        );
      },
    },
    {
      accessorKey: "conversion_status",
      header: "Conversão",
      cell: ({ row }) => {
        const v = row.getValue("conversion_status") as string;
        return (
          <Badge variant={conversionVariants[v] ?? "outline"}>
            {conversionLabels[v] ?? v}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const lead = row.original;
        const canConvert = lead.conversion_status !== "converted";

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlers.onEdit(lead)}>
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
                    onClick={() => handlers.onConvert(lead)}
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Marcar convertido</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <Link href={`/dashboard/projects/${handlers.projectId}/leads/${lead.id}`} aria-label="Histórico">
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
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handlers.onDelete(lead)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}
