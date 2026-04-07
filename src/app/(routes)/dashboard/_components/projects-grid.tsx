"use client";

import { ProjectCard } from "./project-card";

interface ProjectsGridProps {
  projects: {
    id: string;
    name: string;
    created_at: Date;
    updated_at: Date;
    lead_count: number;
  }[];
}

export const ProjectsGrid = ({ projects }: ProjectsGridProps) => {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          Nenhum projeto cadastrado. Crie um para começar a registrar leads.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
