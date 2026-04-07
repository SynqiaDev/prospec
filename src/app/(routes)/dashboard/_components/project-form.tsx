"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createProject } from "@/actions/project/create-project";
import { updateProject } from "@/actions/project/update-project";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const projectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  defaultValues?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
}

export const ProjectForm = ({ defaultValues, onSuccess }: ProjectFormProps) => {
  const isEditMode = !!defaultValues;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues
      ? { name: defaultValues.name }
      : { name: "" },
  });

  const { execute: executeCreate, status: createStatus } = useAction(createProject, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Projeto criado com sucesso!");
        form.reset();
        onSuccess?.();
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao criar projeto");
    },
  });

  const { execute: executeUpdate, status: updateStatus } = useAction(updateProject, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Projeto atualizado com sucesso!");
        onSuccess?.();
      } else {
        toast.error(data?.error || "Erro ao atualizar projeto");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao atualizar projeto");
    },
  });

  const isLoading = createStatus === "executing" || updateStatus === "executing";

  const onSubmit = (values: ProjectFormValues) => {
    if (isEditMode && defaultValues) {
      executeUpdate({ id: defaultValues.id, ...values });
    } else {
      executeCreate(values);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-4"
      >
        <div className="w-full min-w-0 xl:flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Prospecção zona sul" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex w-full justify-end xl:w-auto xl:shrink-0 xl:pb-px">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={isLoading}
                variant="default"
                className="w-full min-h-10 sm:w-auto"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isEditMode ? "Salvar alterações do projeto" : "Criar novo projeto"}
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
    </Form>
  );
};
