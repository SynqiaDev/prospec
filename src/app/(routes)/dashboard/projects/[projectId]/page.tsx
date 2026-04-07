import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/ui/page-container";
import { getLeadsByProjectId } from "@/data/leads/get-leads";
import { getProjectById } from "@/data/projects/get-projects";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LeadsTable } from "./_components/leads-table";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLeadsPage({ params }: PageProps) {
  const { projectId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const project = await getProjectById(projectId);
  if (!project) {
    notFound();
  }

  const leads = await getLeadsByProjectId({ projectId });

  return (
    <PageContainer>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Projetos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <div>
          <PageTitle>{project.name}</PageTitle>
          <PageDescription>Leads de prospecção deste projeto.</PageDescription>
        </div>
      </PageHeader>
      <PageContent>
        <LeadsTable projectId={projectId} leads={leads} />
      </PageContent>
    </PageContainer>
  );
}
