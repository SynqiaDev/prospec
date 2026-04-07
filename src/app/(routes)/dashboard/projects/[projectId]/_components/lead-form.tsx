"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createLead } from "@/actions/lead/create-lead";
import { updateLead } from "@/actions/lead/update-lead";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { LeadRow } from "./lead-columns";

const optionalDate = z.string().optional();

const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp_number: z.string().optional(),
  website_url: z.string().optional(),
  google_rating: z.string().optional(),
  google_review_count: z.string().optional(),
  observations: z.string().optional(),
  contact_status: z.string().min(1),
  contact_date: optionalDate,
  conversion_status: z.string().min(1),
  conversion_date: optionalDate,
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

function parseOptionalDate(s: string | undefined): Date | null | undefined {
  if (s == null || s.trim() === "") return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDatetimeLocalValue(d: Date | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

function parseRating(s: string | undefined): number | undefined {
  if (s == null || s.trim() === "") return undefined;
  const n = Number(s.replace(",", "."));
  if (Number.isNaN(n)) return undefined;
  return Math.min(5, Math.max(0, n));
}

function parseReviewCount(s: string | undefined): number | undefined {
  if (s == null || s.trim() === "") return undefined;
  const n = parseInt(s, 10);
  if (Number.isNaN(n) || n < 0) return undefined;
  return n;
}

const CONTACT_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "contacted", label: "Contatado" },
  { value: "no_answer", label: "Sem resposta" },
  { value: "scheduled", label: "Agendado" },
];

const CONVERSION_OPTIONS = [
  { value: "not_converted", label: "Não convertido" },
  { value: "converted", label: "Convertido" },
  { value: "lost", label: "Perdido" },
];

interface LeadFormProps {
  projectId: string;
  defaultValues?: LeadRow;
  onSuccess?: () => void;
}

export const LeadForm = ({ projectId, defaultValues, onSuccess }: LeadFormProps) => {
  const isEdit = !!defaultValues;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          address: defaultValues.address ?? "",
          phone: defaultValues.phone ?? "",
          whatsapp_number: defaultValues.whatsapp_number ?? "",
          website_url: defaultValues.website_url ?? "",
          google_rating:
            defaultValues.google_rating != null ? String(defaultValues.google_rating) : "",
          google_review_count:
            defaultValues.google_review_count != null
              ? String(defaultValues.google_review_count)
              : "",
          observations: defaultValues.observations ?? "",
          contact_status: defaultValues.contact_status,
          contact_date: toDatetimeLocalValue(defaultValues.contact_date),
          conversion_status: defaultValues.conversion_status,
          conversion_date: toDatetimeLocalValue(defaultValues.conversion_date),
        }
      : {
          name: "",
          address: "",
          phone: "",
          whatsapp_number: "",
          website_url: "",
          google_rating: "",
          google_review_count: "",
          observations: "",
          contact_status: "pending",
          contact_date: "",
          conversion_status: "not_converted",
          conversion_date: "",
        },
  });

  const { execute: executeCreate, status: createStatus } = useAction(createLead, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Lead criado!");
        form.reset();
        onSuccess?.();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar lead");
    },
  });

  const { execute: executeUpdate, status: updateStatus } = useAction(updateLead, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Lead atualizado!");
        onSuccess?.();
      } else {
        toast.error(data?.error || "Erro ao atualizar lead");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar lead");
    },
  });

  const busy = createStatus === "executing" || updateStatus === "executing";

  const onSubmit = (values: LeadFormValues) => {
    const google_rating = parseRating(values.google_rating);
    const google_review_count = parseReviewCount(values.google_review_count);
    const contact_date = parseOptionalDate(values.contact_date);
    const conversion_date = parseOptionalDate(values.conversion_date);

    const base = {
      name: values.name,
      address: values.address || undefined,
      phone: values.phone || undefined,
      whatsapp_number: values.whatsapp_number || undefined,
      website_url: values.website_url || undefined,
      google_rating,
      google_review_count,
      observations: values.observations || undefined,
      contact_status: values.contact_status,
      contact_date: contact_date ?? null,
      conversion_status: values.conversion_status,
      conversion_date: conversion_date ?? null,
      project_id: projectId,
    };

    if (isEdit && defaultValues) {
      executeUpdate({
        id: defaultValues.id,
        ...base,
      });
    } else {
      executeCreate(base);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-h-[min(70vh,36rem)] space-y-4 overflow-y-auto pr-1 sm:max-h-[75vh] xl:grid xl:max-h-[85vh] xl:grid-cols-12 xl:gap-x-4 xl:gap-y-3 xl:space-y-0"
      >
        <div className="xl:col-span-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do estabelecimento" className="min-h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="xl:col-span-7">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" className="min-h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:contents">
          <div className="xl:col-span-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="xl:col-span-4">
            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Opcional" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="xl:col-span-4">
          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." className="min-h-10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:contents">
          <div className="xl:col-span-3">
            <FormField
              control={form.control}
              name="google_rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota Google (0–5)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 4,5" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="xl:col-span-3">
            <FormField
              control={form.control}
              name="google_review_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qtd. avaliações</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} placeholder="0" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="xl:col-span-6">
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Opcional"
                    className="min-h-20 resize-y xl:min-h-14 xl:max-h-28 xl:py-2"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:contents">
          <div className="xl:col-span-6">
            <FormField
              control={form.control}
              name="contact_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de contato</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTACT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="xl:col-span-6">
            <FormField
              control={form.control}
              name="contact_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do contato</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:contents">
          <div className="xl:col-span-6">
            <FormField
              control={form.control}
              name="conversion_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de conversão</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONVERSION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="xl:col-span-6">
            <FormField
              control={form.control}
              name="conversion_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data da conversão</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="min-h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end pt-2 xl:col-span-12 xl:pt-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={busy} className="h-10 w-full min-h-10 sm:w-auto">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isEdit ? "Salvar lead" : "Criar lead"}</TooltipContent>
          </Tooltip>
        </div>
      </form>
    </Form>
  );
};
