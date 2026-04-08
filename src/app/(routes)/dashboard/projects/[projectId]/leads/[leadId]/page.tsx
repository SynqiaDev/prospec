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
import { getLeadTimelineByLeadId } from "@/data/leads/get-lead-timeline";
import { getLeadById } from "@/data/leads/get-leads";
import { getProjectById } from "@/data/projects/get-projects";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LeadHistoryView } from "./_components/lead-history-view";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ projectId: string; leadId: string }>;
}

export default async function LeadHistoryPage({ params }: PageProps) {
  const { projectId, leadId } = await params;

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

  const lead = await getLeadById(leadId);
  if (!lead || lead.project_id !== projectId) {
    notFound();
  }

  const entries = await getLeadTimelineByLeadId({ leadId });

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
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/projects/${projectId}`}>{project.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Histórico: {lead.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <div>
          <PageTitle>Histórico do lead</PageTitle>
          <PageDescription>{lead.name}</PageDescription>
        </div>
      </PageHeader>
      <PageContent>
        <LeadHistoryView projectId={projectId} leadId={leadId} entries={entries} />
      </PageContent>
    </PageContainer>
  );
}
