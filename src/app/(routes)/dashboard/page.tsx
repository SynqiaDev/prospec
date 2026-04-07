import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/ui/page-container";
import { getProjects } from "@/data/projects/get-projects";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { CreateProjectDialog } from "./_components/create-project-dialog";
import { ProjectsGrid } from "./_components/projects-grid";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const projects = await getProjects();

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>Projetos</PageTitle>
          <PageDescription>
            Organize campanhas de prospecção e acompanhe os leads por projeto.
          </PageDescription>
        </div>
        <PageActions>
          <CreateProjectDialog />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ProjectsGrid projects={projects} />
      </PageContent>
    </PageContainer>
  );
}
