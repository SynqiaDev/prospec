"use client";

import dayjs from "dayjs";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_SOURCE_OPTIONS } from "@/lib/lead-source";

import { contactStatusLabels, conversionLabels } from "./lead-columns";

export type DateRangePreset = "all" | "today" | "last7" | "last30" | "thisMonth";

const DATE_PRESET_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "all", label: "Qualquer data" },
  { value: "today", label: "Hoje" },
  { value: "last7", label: "Últimos 7 dias" },
  { value: "last30", label: "Últimos 30 dias" },
  { value: "thisMonth", label: "Este mês" },
];

const CONTACT_OPTIONS = Object.entries(contactStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

const CONVERSION_OPTIONS = Object.entries(conversionLabels).map(([value, label]) => ({
  value,
  label,
}));

export function matchesCreatedAtPreset(
  createdAt: Date | string | null,
  preset: DateRangePreset,
): boolean {
  if (preset === "all") return true;
  if (createdAt == null) return false;
  const d = dayjs(createdAt);
  const now = dayjs();
  switch (preset) {
    case "today":
      return d.isSame(now, "day");
    case "last7":
      return !d.isBefore(now.subtract(7, "day").startOf("day"));
    case "last30":
      return !d.isBefore(now.subtract(30, "day").startOf("day"));
    case "thisMonth":
      return d.isSame(now, "month") && d.isSame(now, "year");
    default:
      return true;
  }
}

export const ALL_VALUE = "__all";

/** Valor do Select para leads sem UF (Radix não aceita value vazio). */
export const NO_STATE_VALUE = "__no_state__";

export interface LeadsFiltersProps {
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  datePreset: DateRangePreset;
  onDatePresetChange: (value: DateRangePreset) => void;
  stateUf: string;
  onStateUfChange: (value: string) => void;
  stateOptions: { value: string; label: string }[];
  conversion: string;
  onConversionChange: (value: string) => void;
  contactStatus: string;
  onContactStatusChange: (value: string) => void;
  leadSource: string;
  onLeadSourceChange: (value: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function LeadsFilters({
  nameQuery,
  onNameQueryChange,
  datePreset,
  onDatePresetChange,
  stateUf,
  onStateUfChange,
  stateOptions,
  conversion,
  onConversionChange,
  contactStatus,
  onContactStatusChange,
  leadSource,
  onLeadSourceChange,
  onReset,
  hasActiveFilters,
}: LeadsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-2">
          <Label htmlFor="lead-filter-name">Nome</Label>
          <Input
            id="lead-filter-name"
            placeholder="Buscar por nome…"
            value={nameQuery}
            onChange={(e) => onNameQueryChange(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-filter-date">Período</Label>
          <Select value={datePreset} onValueChange={(v) => onDatePresetChange(v as DateRangePreset)}>
            <SelectTrigger id="lead-filter-date" className="w-full">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESET_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-filter-state">UF</Label>
          <Select value={stateUf} onValueChange={onStateUfChange}>
            <SelectTrigger id="lead-filter-state" className="w-full">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {stateOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-filter-conversion">Conversão</Label>
          <Select value={conversion} onValueChange={onConversionChange}>
            <SelectTrigger id="lead-filter-conversion" className="w-full">
              <SelectValue placeholder="Conversão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {CONVERSION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-filter-contact">Status de contato</Label>
          <Select value={contactStatus} onValueChange={onContactStatusChange}>
            <SelectTrigger id="lead-filter-contact" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {CONTACT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-filter-source">Origem</Label>
          <Select value={leadSource} onValueChange={onLeadSourceChange}>
            <SelectTrigger id="lead-filter-source" className="w-full">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {LEAD_SOURCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end border-t pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
