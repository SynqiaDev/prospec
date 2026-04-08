"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { InferSelectModel } from "drizzle-orm";
import { Loader2, Plus, Save } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createLeadTimelineEntry } from "@/actions/lead/create-lead-timeline-entry";
import { updateLeadTimelineEntry } from "@/actions/lead/update-lead-timeline-entry";
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
import { leadTimelineEntries } from "@/db/schema";

const leadTimelineFormSchema = z.object({
  entry_type: z.string().min(1),
  body: z.string().min(1, "Descrição é obrigatória"),
  channel: z.string().optional(),
  direction: z.string().optional(),
  outcome: z.string().optional(),
  occurred_at: z.string().optional(),
  follow_up_at: z.string().optional(),
});

type LeadTimelineFormValues = z.infer<typeof leadTimelineFormSchema>;

type LeadTimelineEntry = InferSelectModel<typeof leadTimelineEntries>;

const toDatetimeLocalInputValue = (value: Date | string | null | undefined) => {
  if (value == null) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface LeadTimelineFormProps {
  leadId: string;
  projectId: string;
  onSuccess: () => void;
  editingEntry?: LeadTimelineEntry | null;
  onCancelEdit?: () => void;
}

const ENTRY_TYPE_OPTIONS = [
  { value: "note", label: "Anotação" },
  { value: "contact_attempt", label: "Tentativa de contato" },
  { value: "contact_reply", label: "Resposta de contato" },
  { value: "status_change", label: "Mudança de status" },
  { value: "conversion", label: "Conversão" },
];

const CHANNEL_OPTIONS = [
  { value: "phone", label: "Telefone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail" },
  { value: "visit", label: "Visita" },
  { value: "other", label: "Outro" },
];

const DIRECTION_OPTIONS = [
  { value: "outbound", label: "Saída" },
  { value: "inbound", label: "Entrada" },
];

const parseDate = (value: string | undefined) => {
  if (!value || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const LeadTimelineForm = ({
  leadId,
  projectId,
  onSuccess,
  editingEntry = null,
  onCancelEdit,
}: LeadTimelineFormProps) => {
  const form = useForm<LeadTimelineFormValues>({
    resolver: zodResolver(leadTimelineFormSchema),
    defaultValues: {
      entry_type: "note",
      body: "",
      channel: undefined,
      direction: undefined,
      outcome: "",
      occurred_at: "",
      follow_up_at: "",
    },
  });

  const { execute: executeCreate, status: createStatus } = useAction(createLeadTimelineEntry, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Anotação adicionada.");
        form.reset({
          entry_type: "note",
          body: "",
          channel: undefined,
          direction: undefined,
          outcome: "",
          occurred_at: "",
          follow_up_at: "",
        });
        onSuccess();
      } else {
        toast.error(data?.error || "Não foi possível adicionar a anotação");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao adicionar anotação");
    },
  });

  const { execute: executeUpdate, status: updateStatus } = useAction(updateLeadTimelineEntry, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Entrada atualizada.");
        onSuccess();
      } else {
        toast.error(data?.error || "Não foi possível atualizar");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar");
    },
  });

  useEffect(() => {
    if (editingEntry) {
      form.reset({
        entry_type: editingEntry.entry_type,
        body: editingEntry.body,
        channel: editingEntry.channel ?? undefined,
        direction: editingEntry.direction ?? undefined,
        outcome: editingEntry.outcome ?? "",
        occurred_at: toDatetimeLocalInputValue(editingEntry.occurred_at),
        follow_up_at: toDatetimeLocalInputValue(editingEntry.follow_up_at),
      });
    } else {
      form.reset({
        entry_type: "note",
        body: "",
        channel: undefined,
        direction: undefined,
        outcome: "",
        occurred_at: "",
        follow_up_at: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-sync when toggling edit target; `form` is stable from useForm
  }, [editingEntry]);

  const loading = createStatus === "executing" || updateStatus === "executing";

  const onSubmit = (values: LeadTimelineFormValues) => {
    const occurred = parseDate(values.occurred_at) ?? null;
    const followUp = parseDate(values.follow_up_at) ?? null;

    if (editingEntry) {
      executeUpdate({
        entry_id: editingEntry.id,
        lead_id: leadId,
        project_id: projectId,
        entry_type: values.entry_type,
        body: values.body,
        channel: values.channel || undefined,
        direction: values.direction || undefined,
        outcome: values.outcome || undefined,
        occurred_at: occurred,
        follow_up_at: followUp,
      });
      return;
    }

    executeCreate({
      lead_id: leadId,
      project_id: projectId,
      entry_type: values.entry_type,
      body: values.body,
      channel: values.channel || undefined,
      direction: values.direction || undefined,
      outcome: values.outcome || undefined,
      occurred_at: occurred,
      follow_up_at: followUp,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="entry_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ENTRY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="direction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Direção</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIRECTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Descreva o que aconteceu com este lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultado</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: sem resposta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="occurred_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do evento</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="follow_up_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Próximo contato</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          {editingEntry && onCancelEdit ? (
            <Button type="button" variant="outline" disabled={loading} onClick={onCancelEdit}>
              Cancelar edição
            </Button>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingEntry ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingEntry ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
