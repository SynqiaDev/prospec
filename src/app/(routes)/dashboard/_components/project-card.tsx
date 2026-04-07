"use client";

import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { ArrowUpRight, FolderOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { DeleteProjectDialog } from "./delete-project-dialog";
import { EditProjectDialog } from "./edit-project-dialog";

dayjs.locale("pt-br");

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    lead_count: number;
  };
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>Prospecção e leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-start gap-2 text-muted-foreground">
            <FolderOpen className="h-4 w-4" />
            <p className="text-sm">
              {project.lead_count} {project.lead_count === 1 ? "lead" : "leads"}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">Criado em:</span>{" "}
            {dayjs(project.created_at).format("DD/MM/YYYY [às] HH:mm")}
          </p>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <ArrowUpRight className="h-2 w-2" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Abrir leads</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Pencil className="h-2 w-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="hover:shadow-xl hover:bg-destructive hover:text-white hover:scale-105 transition-all duration-300"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-2 w-2" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>

      <EditProjectDialog
        project={{
          id: project.id,
          name: project.name,
        }}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteProjectDialog
        project={{ id: project.id, name: project.name }}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
};
